import express from "express";
import { AutoScalingClient, SetDesiredCapacityCommand, DescribeAutoScalingInstancesCommand, TerminateInstanceInAutoScalingGroupCommand } from "@aws-sdk/client-auto-scaling";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const app = express();
const client = new AutoScalingClient({ region: "eu-north-1", credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_ACCESS_SECRET!,
} });

const ec2Client = new EC2Client({ region: "eu-north-1", credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_ACCESS_SECRET!,
}})

type Machine = {
    ip: string;
    isUsed: boolean;
    assignedProject?: string;
}

const ALL_MACHINES: Machine[] = [];

async function refershInstances() {
    const command = new DescribeAutoScalingInstancesCommand();
    const data = await client.send(command);

    const ec2InstanceCommand = new DescribeInstancesCommand({
        InstanceIds: data.AutoScalingInstances?.map(x => x?.InstanceId ?? "")
    })

    const ec2Response = await ec2Client.send(ec2InstanceCommand);
    const newInstances = ec2Response.Reservations?.map(x => x.Instances).flat().filter(x => x?.State?.Name === "running");
    const runningIps = new Set(newInstances?.map(x => x?.PublicDnsName) ?? []);

    ALL_MACHINES.forEach(x => {
        if (!runningIps.has(x.ip)) {    
            x.isUsed = false;
        }
    })

    ALL_MACHINES.push(...(newInstances?.map(x => ({
        ip: x?.PublicDnsName ?? "",
        isUsed: false,
        assignedProject: undefined
    })) ?? []));
}

refershInstances();

setInterval(() => {
    refershInstances();
}, 10 * 1000);

app.get("/:projectId", (req, res) => {
    const idleMachine = ALL_MACHINES.find(x => x.isUsed === false);
    if (!idleMachine) {
       
        res.status(404).send("No idle machine found");
        return;
    }

    idleMachine.isUsed = true;
    

    const command = new SetDesiredCapacityCommand({
        AutoScalingGroupName: "pixe-asg",
        DesiredCapacity: ALL_MACHINES.length + (5 - ALL_MACHINES.filter(x => x.isUsed === false).length)

    })

    client.send(command);

    res.send({
        ip: idleMachine.ip
    });
})

app.post("/destroy", (req, res) => {
    const machineId: string = req.body.machineId;

    const command = new TerminateInstanceInAutoScalingGroupCommand({
        InstanceId: machineId,
        ShouldDecrementDesiredCapacity: true
    })

    client.send(command);
})

app.listen(6969);
