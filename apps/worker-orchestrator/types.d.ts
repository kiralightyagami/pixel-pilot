
declare type EC2Instance = {
    InstanceId?: string;
    PublicDnsName?: string;
    State?: {
        Name?: string;
    };
};

declare type EC2Reservation = {
    Instances?: EC2Instance[];
};

declare type EC2Response = {
    Reservations?: EC2Reservation[];
};
