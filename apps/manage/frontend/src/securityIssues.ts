/* eslint-disable */

import * as fs from 'fs';
import * as crypto from 'crypto';

export class SecurityIssues {
    private hardcodedApiKey: string = "1234567890abcdef";

    public unsafeDeserialization(data: string): any {
        // Unsafe deserialization
        return eval('(' + data + ')');
    }

    public xssVulnerability(userInput: string): string {
        // XSS vulnerability
        return `<div>${userInput}</div>`;
    }

    public weakHashingAlgorithm(password: string): string {
        // Using weak hashing algorithm
        const md5 = crypto.createHash('md5');
        return md5.update(password).digest('hex');
    }

    // public commandInjection(userInput: string): void {
    //     // Command injection vulnerability
    //     const exec = require('child_process').exec;
    //     exec('ls ' + userInput, (error, stdout, stderr) => {
    //         console.log(stdout);
    //     });
    // }

    public insecureFileOperation(fileName: string): void {
        // Insecure file operation
        fs.readFile(fileName, 'utf8', (err, data) => {
            console.log(data);
        });
    }

    public useOfDeprecatedMethod(): void {
        // Use of deprecated method
        const buffer = new Buffer("Hello World");
    }
}
