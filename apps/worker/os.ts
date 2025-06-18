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


const hasAWSCredentials = process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_SECRET_ACCESS_KEY && 
                         process.env.AWS_S3_BUCKET;

let s3Client: S3Client | null = null;

if (hasAWSCredentials) {
    s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });
}

export const createAnimation = async (projectId: string, promptId: string) => {
    try {
        const animations = await prisma.animation.findMany({
            where: {
                projectId,
                promptId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!animations || animations.length === 0) {
            throw new Error("No animations found");
        }

       
        const animation = animations[0];
        
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

        let videoUrl: string;

        if (hasAWSCredentials && s3Client) {
            
            try {
                const videoBuffer = await fs.promises.readFile(outputPath);
                const s3Key = `animations/${projectId}/${promptId}.mp4`;
                
                await s3Client.send(
                    new PutObjectCommand({
                        Bucket: process.env.AWS_S3_BUCKET!,
                        Key: s3Key,
                        Body: videoBuffer,
                        ContentType: "video/mp4",
                    })
                );

                videoUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
                
                
                await fs.promises.rm(tempDir, { recursive: true, force: true });
            } catch (uploadError) {
                console.error("S3 upload failed, keeping local file:", uploadError);
                
                videoUrl = `file://${outputPath}`;
            }
        } else {
            
            console.log("No AWS credentials configured, keeping video locally at:", outputPath);
            videoUrl = `file://${outputPath}`;
        }

        
        await prisma.animation.update({
            where: { id: animation.id },
            data: { videoUrl: videoUrl },
        });

        return { success: true, videoUrl: videoUrl };
    } catch (error) {
        console.error("Error creating animation:", error);
        throw error;
    }
};

async function createSimpleAnimation(tempDir: string, sceneCode: string, outputPath: string) {
    try {
        console.log("Rendering Manim Python code:", sceneCode);
        
       
        const pythonScriptPath = path.join(tempDir, 'scene.py');
        await fs.promises.writeFile(pythonScriptPath, sceneCode);
        
        
        await renderManim(pythonScriptPath, outputPath, tempDir);

    } catch (error) {
        console.error("Error creating Manim animation:", error);
        throw error;
    }
}

async function renderManim(pythonScriptPath: string, outputPath: string, tempDir: string) {
    try {
        console.log("🎬 RENDERING MANIM ANIMATION");
        console.log("Python script path:", pythonScriptPath);
        
       
        await renderWithManim(pythonScriptPath, outputPath, tempDir);
        
    } catch (error) {
        console.error("❌ Manim rendering failed:", error);
        console.log("🔄 Using fallback renderer...");
       
        await createFallbackVideo(outputPath);
    }
}

async function renderWithManim(pythonScriptPath: string, outputPath: string, tempDir: string) {
    return new Promise<void>((resolve, reject) => {
        const { exec } = require('child_process');
        
       
        const sceneCode = fs.readFileSync(pythonScriptPath, 'utf-8');
        const classMatch = sceneCode.match(/class\s+(\w+)\s*\(/);
        const className = classMatch ? classMatch[1] : 'Scene';
        
        console.log(`🎨 Rendering Manim scene: ${className}`);
        console.log(`📁 Working directory: ${tempDir}`);
        console.log(`📄 Python script: ${pythonScriptPath}`);
        
        
        const manimCommand = `python -m manim -ql "${pythonScriptPath}" ${className}`;
        
        console.log(`🔧 Executing: ${manimCommand}`);
        
        exec(manimCommand, {
            cwd: tempDir,
            timeout: 60000, 
        }, async (error: Error | null, stdout: string, stderr: string) => {
            console.log('📤 Manim stdout:', stdout);
            if (stderr) console.log('⚠️ Manim stderr:', stderr);
            
            if (error) {
                console.error('❌ Manim execution failed:', error);
                reject(error);
                return;
            }
            
            try {
                
                const sceneName = path.basename(pythonScriptPath, '.py');
                
                
                const searchPaths = [
                    path.join(tempDir, 'media', 'videos', sceneName, '480p15', `${className}.mp4`),
                    path.join(tempDir, 'media', 'videos', sceneName, '720p30', `${className}.mp4`),
                    path.join(tempDir, 'media', 'videos', sceneName, '1080p60', `${className}.mp4`),
                    path.join(process.cwd(), 'media', 'videos', sceneName, '480p15', `${className}.mp4`),
                    path.join(process.cwd(), 'apps', 'worker', 'media', 'videos', sceneName, '480p15', `${className}.mp4`)
                ];
                
                let foundVideoPath = null;
                for (const searchPath of searchPaths) {
                    console.log(`🔍 Checking: ${searchPath}`);
                    if (fs.existsSync(searchPath)) {
                        foundVideoPath = searchPath;
                        console.log(`✅ Found Manim video: ${foundVideoPath}`);
                        break;
                    }
                }
                
                if (foundVideoPath) {
                    
                    await fs.promises.copyFile(foundVideoPath, outputPath);
                    console.log(`📋 Copied video to: ${outputPath}`);
                    
                    
                    const stats = await fs.promises.stat(outputPath);
                    console.log(`✅ Output file size: ${stats.size} bytes`);
                    
                    resolve();
                } else {
                    console.error('❌ Could not find Manim output video in any expected location');
                    
                   
                    console.log('📁 Temp directory contents:');
                    await listDirectoryRecursive(tempDir);
                    
                    reject(new Error('Manim output video not found'));
                }
            } catch (copyError) {
                console.error('❌ Error handling Manim output:', copyError);
                reject(copyError);
            }
        });
    });
}


async function listDirectoryRecursive(dir: string, depth: number = 0) {
    const indent = '  '.repeat(depth);
    try {
        const items = await fs.promises.readdir(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = await fs.promises.stat(fullPath);
            if (stats.isDirectory()) {
                console.log(`${indent}📁 ${item}/`);
                if (depth < 3) { // Limit recursion depth
                    await listDirectoryRecursive(fullPath, depth + 1);
                }
            } else {
                console.log(`${indent}📄 ${item} (${stats.size} bytes)`);
            }
        }
    } catch (err) {
        console.log(`${indent}❌ Error reading directory: ${err}`);
    }
}

async function createFallbackVideo(outputPath: string) {
    console.log("🔄 Creating fallback moving circle animation");
    
    return new Promise<void>((resolve, reject) => {
        ffmpeg()
            .input('color=c=white:size=1920x1080:duration=3')
            .inputFormat('lavfi')
            .videoFilter([
                
                'drawbox=x=100+1720*t/3-50:y=490:w=100:h=100:color=blue:t=fill',
               
                'drawtext=fontfile=/Windows/Fonts/arial.ttf:text="Fallback: Circle Animation":fontsize=24:fontcolor=black:x=50:y=50'
            ])
            .outputOptions(['-r', '30'])
            .output(outputPath)
            .on('end', () => {
                console.log("✅ Fallback circle animation created");
                resolve();
            })
            .on('error', (err: Error) => {
                console.error("❌ Error creating fallback video:", err);
                reject(err);
            })
            .run();
    });
}