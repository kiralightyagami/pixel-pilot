import { prisma } from "db/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export const createAnimation = async (projectId: string, promptId: string) => {
    try {
        
        const animation = await prisma.animation.findFirst({
            where: {
                projectId,
                promptId,
            },
        });

        if (!animation) {
            throw new Error("Animation not found");
        }

        
        const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "motion-"));
        const codePath = path.join(tempDir, "animation.ts");
        const outputPath = path.join(tempDir, "output.mp4");

       
        await fs.promises.writeFile(codePath, animation.code);

       
        await execAsync(`npx motion-canvas render ${codePath} -o ${outputPath}`);

        
        const videoBuffer = await fs.promises.readFile(outputPath);

        
        const s3Key = `animations/${projectId}/${promptId}.mp4`;
        await s3Client.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET || "",
                Key: s3Key,
                Body: videoBuffer,
                ContentType: "video/mp4",
            })
        );

       
        await fs.promises.rm(tempDir, { recursive: true, force: true });

        
        const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        await prisma.animation.update({
            where: { id: animation.id },
            data: { videoUrl: s3Url },
        });

        return { success: true, videoUrl: s3Url };
    } catch (error) {
        console.error("Error creating animation:", error);
        throw error;
    }
};