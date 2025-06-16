// {
//     "fullResponse": "Here's the code for a simple animation of a circle moving from
//  left to right, along with an explanation of how it works:\n\nFirst, 
// we import the necessary modules from `@motion-canvas/2d` and `@motion-canvas/core`. 
// We use `makeScene2D` to define our scene, `Circle` to create the circle, and `createRef` 
// to create a reference to the circle so we can animate it.
// \n\nThen, inside the scene's generator function, we add a circle to the view. 
//  We set its initial `x` position to `-400` (off-screen on the left) and its radius to `50`.\n\nFinally
// , we use `yield*` to animate the circle's `x` position from `-400` to `400` over a duration of 2 seconds.
//  This creates the animation of the circle moving from left to right.
// \n\n<code>\n
// import {makeScene2D} from '@motion-canvas/2d';
// \nimport {Circle} from '@motion-canvas/2d';
// \nimport {createRef} from '@motion-canvas/core';
// \n\nexport default makeScene2D(function* (view) {
// \n  const circle = createRef<Circle>();
// \n\n  view.add(
// \n    <Circle\n      ref={circle}\n      x={-400}\n      radius={50}
// \n      fill=\"#e76f51\"\n    />
// \n  );
// \n\n  yield* circle().x.to(400, 2);
// \n});
// \n</code>
// \n"
// }

// export const parseResponse = (response:string) => {
//     const code = response.match(/<code>(.*?)<\/code>/s);
//     const explanation = response.match(/<explanation>(.*?)<\/explanation>/s);
//     return {
//         code: code ? code[1] : null,
//         explanation: explanation ? explanation[1] : null
//     }
// }

export class Parser {
    private code: string = "";
    private explanation: string = "";
    private remainingText: string = "";

    constructor(response?: string) {
        if (response) {
            this.parse(response);
        }
    }

    public parseChunk(chunk: string) {
        this.parse(chunk);
    }

    private parse(response: string) {
       
        this.code = "";
        this.explanation = "";
        this.remainingText = "";

        
        const htmlCodeMatch = response.match(/<code>\s*([\s\S]*?)\s*<\/code>/);
        if (htmlCodeMatch && htmlCodeMatch[1]) {
            this.code = htmlCodeMatch[1].trim();
        }

        
        if (!this.code) {
            const codeBlockMatch = response.match(/```(?:typescript)?\n([\s\S]*?)```/);
            if (codeBlockMatch && codeBlockMatch[1]) {
                this.code = codeBlockMatch[1].trim();
            }
        }

        
        const htmlExplanationMatch = response.match(/<explanation>\s*([\s\S]*?)\s*<\/explanation>/);
        if (htmlExplanationMatch && htmlExplanationMatch[1]) {
            this.explanation = htmlExplanationMatch[1].trim();
        }

        
        if (!this.explanation) {
            const explanationMatch = response.match(/Explanation:\s*\n([\s\S]*?)(?:\n\n|\Z)/);
            if (explanationMatch && explanationMatch[1]) {
                this.explanation = explanationMatch[1].trim();
                } else {
            
                const afterCodeMatch = response.match(/(?:```|<\/code>)\s*\n([\s\S]*)/);
                if (afterCodeMatch && afterCodeMatch[1]) {
                    
                    let explanationText = afterCodeMatch[1]
                        .replace(/^Explanation:\s*\n?/i, '')
                        .replace(/^\*\*Explanation:\*\*\s*\n?/i, '')
                        .trim();
                    
                    if (explanationText) {
                        this.explanation = explanationText;
                    }
                }
            }
        }

        
        if (!this.code && response.trim()) {
            this.remainingText = response.trim();
        }
    }

    public getText() {
        return [this.code, this.explanation, this.remainingText].join("\n");
    }

    public getCode() {
        return this.code;
    }

    public getExplanation() {
        return this.explanation;
    }

    public getRemainingText() {
        return this.remainingText;
    }

    public getFullResponse() {
        return {
            code: this.getCode(),
            explanation: this.getExplanation(),
            remainingText: this.getRemainingText()
        };
    }
}