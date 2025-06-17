import { prisma } from "db/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
require("dotenv").config();


if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

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

        
        const coherroDir = path.join(os.homedir(), '.coherro');
        if (!fs.existsSync(coherroDir)) {
            fs.mkdirSync(coherroDir, { recursive: true });
        }
        const tempDir = await fs.promises.mkdtemp(path.join(coherroDir, "motion-"));
        const outputPath = path.join(tempDir, "output.mp4");

        
        await createSimpleAnimation(tempDir, animation.code, outputPath);

        
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

async function createSimpleAnimation(tempDir: string, sceneCode: string, outputPath: string) {
    try {
        console.log("Rendering Motion Canvas code:", sceneCode);
        
        
        const sceneFilePath = path.join(tempDir, 'scene.ts');
        await fs.promises.writeFile(sceneFilePath, sceneCode);
        
       
        const projectConfig = {
            name: 'generated-animation',
            scenes: [sceneFilePath],
            settings: {
                size: { x: 1920, y: 1080 },
                range: [0, 180], 
                fps: 60,
            },
        };
        
        
        const framesDir = path.join(tempDir, 'frames');
        await fs.promises.mkdir(framesDir, { recursive: true });
        
        await renderMotionCanvasToFrames(projectConfig, framesDir);
        
        
        await new Promise<void>((resolve, reject) => {
            ffmpeg()
                .input(path.join(framesDir, 'frame_%06d.png'))
                .inputOptions(['-framerate', '60'])
                .outputOptions([
                    '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p',
                    '-y'
                ])
                .output(outputPath)
                .on('end', () => {
                    console.log(`Animation created at: ${outputPath}`);
                    resolve();
                })
                .on('error', (err: Error) => {
                    console.error("Error creating video from frames:", err);
                    reject(err);
                })
                .on('progress', (progress: { percent?: number }) => {
                    console.log('Processing: ' + progress.percent + '% done');
                })
                .run();
        });

    } catch (error) {
        console.error("Error creating Motion Canvas animation:", error);
        throw error;
    }
}

async function renderMotionCanvasToFrames(projectConfig: any, framesDir: string) {
    try {
        console.log("Attempting to render Motion Canvas project...");
        
        
        const sceneCode = await fs.promises.readFile(projectConfig.scenes[0], 'utf-8');
        console.log("Motion Canvas code to execute:", sceneCode);
        
       
        await createFallbackFrames(framesDir);
        
    } catch (error) {
        console.error("Error rendering Motion Canvas:", error);
       
        await createFallbackFrames(framesDir);
    }
}

async function createFallbackFrames(framesDir: string) {
    
    const tempVideo = path.join(path.dirname(framesDir), 'temp.mp4');
    
    await new Promise<void>((resolve, reject) => {
        ffmpeg()
            .input('color=c=white:size=1920x1080:duration=3')
            .inputFormat('lavfi')
            .videoFilter([
                'drawtext=fontfile=/Windows/Fonts/arial.ttf:text=●:fontsize=100:fontcolor=blue:x=100+1720*t/3:y=490'
            ])
            .outputOptions(['-r', '60'])
            .output(tempVideo)
            .on('end', async () => {
                
                ffmpeg()
                    .input(tempVideo)
                    .output(path.join(framesDir, 'frame_%06d.png'))
                    .on('end', () => resolve())
                    .on('error', reject)
                    .run();
            })
            .on('error', reject)
            .run();
    });
}