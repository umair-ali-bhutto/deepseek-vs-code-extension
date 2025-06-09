// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';
/**
 * @author umair.ali
 * @since 30-JAN-2025
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand('deepseek-vs-code-extension.deepseek', () => {


        const panel = vscode.window.createWebviewPanel(
            'DeepChat',
            'Deep Seek Chat',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(async (message: any) => {
            if (message.command === 'chat') {
                const userText = message.text.trim().toLowerCase();

                // Check for greetings
                const greetings = [
                    'hi',
                    'hello',
                    'hey',
                    'heya',
                    'hiya',
                    'yo',
                    'sup',
                    'salam',
                    'aslamualaikum',
                    'assalamu alaikum',
                    'assalamualaikum',
                    'good morning',
                    'morning',
                    'good afternoon',
                    'afternoon',
                    'good evening',
                    'evening',
                    'greetings',
                    'what’s up',
                    'whats up',
                    'howdy',
                    'hola',
                    'bonjour',
                    'namaste',
                    'sawasdee',
                    'ciao',
                    'konnichiwa',
                    'annyeong',
                    'aloha',
                    'shalom',
                    'peace',
                    'hi there',
                    'hello there'
                ];

                const isGreeting = greetings.some(g => userText === g);


                let userprompt = `
        You are an assistant for a discount management system. A user will type a simple message like "Is there any discount on my HBL card at Burger King in Lahore?" or "Check discount for 1234-5678-9012-3456 at KFC".
        
        Your job is to extract the following values from the message:
        - card_number (if mentioned) 
        - card_type (like Visa, Standard Chartered, Platinum, platinum, american express, master card etc.)
        - restaurant_name or merchant_name
        - merchant_id (if available) like 20000000000015 or like 999999999999999 it will be 15 digits
        - place (like city or area)
        
        If any value is missing, just return null for that field.
        
        Reply ONLY in this JSON format:
        {
          "card_number": "...",
          "card_type": "...",
          "restaurant_name": "...",
          "merchant_id": "...",
          "merchant_name": "...",
          "place": "..."
        }
        
        User message: "${message.text}"
        `;

                if (isGreeting) {
                    userprompt = message.text;
                }


                let responseText = '';

                try {
                    const response = await fetch('http://localhost:11434/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'deepseek-r1:1.5b',
                            messages: [{ role: 'user', content: userprompt }],
                            stream: false
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();
                    const reply = result.message?.content || 'No response';
                    panel.webview.postMessage({ command: 'chatResponse', text: reply });

                } catch (error) {
                    panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(error)}` });
                }
            }
        });

        //         panel.webview.onDidReceiveMessage(async (message: any) => {
        //             if (message.command === 'chat') {
        //                 const userprompt = `
        // You are an assistant for a discount management system. A user will type a simple message like "Is there any discount on my HBL card at Burger King in Lahore?" or "Check discount for 1234-5678-9012-3456 at KFC".

        // Your job is to extract the following values from the message:
        // - card_number (if mentioned) 
        // - card_type (like Visa, Standard Chartered, Platinum, platinum, american express, master card etc.)
        // - restaurant_name or merchant_name
        // - merchant_id (if available) like 20000000000015 or like 999999999999999 it will be 15 digits
        // - place (like city or area)

        // If any value is missing, just return null for that field.

        // Reply ONLY in this JSON format:
        // {
        //   "card_number": "...",
        //   "card_type": "...",
        //   "restaurant_name": "...",
        //   "merchant_id": "...",
        //   "merchant_name": "...",
        //   "place": "..."
        // }

        // User message: "${message.text}"
        // `;

        //                 // const userprompt = message.text;
        //                 let responseText = '';

        //                 // try {
        //                 //     const streamResponse = await ollama.chat({
        //                 //         model: 'deepseek-r1:1.5b',
        //                 //         messages: [{ role: 'user', content: userprompt }],
        //                 //         stream: true
        //                 //     });

        //                 //     for await (const part of streamResponse) {
        //                 //         responseText += part.message.content;
        //                 //         panel.webview.postMessage({ command: 'chatResponse', text: responseText });
        //                 //     }
        //                 // } catch (error) {
        //                 //     panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(error)}` });
        //                 // }

        //                 try {
        //                     const response = await fetch('http://localhost:11434/api/chat', {
        //                         method: 'POST',
        //                         headers: { 'Content-Type': 'application/json' },
        //                         body: JSON.stringify({
        //                             model: 'deepseek-r1:1.5b',
        //                             messages: [{ role: 'user', content: userprompt }],
        //                             stream: false // set to false for non-streaming
        //                         })
        //                     });

        //                     if (!response.ok) {
        //                         throw new Error(`HTTP error! status: ${response.status}`);
        //                     }

        //                     const result = await response.json();
        //                     const reply = result.message?.content || 'No response';
        //                     panel.webview.postMessage({ command: 'chatResponse', text: reply });

        //                 } catch (error) {
        //                     panel.webview.postMessage({ command: 'chatResponse', text: `Error: ${String(error)}` });
        //                 }
        //             }
        //         });

    });

    context.subscriptions.push(disposable);
}


function getWebviewContent(): string {
    return /*HTML*/`

	<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deep Seek VS Code Extension</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #282c34;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }

        h2 {
            margin-bottom: 20px;
            font-size: 2em;
            color: #61dafb;
        }

        textarea {
            width: 80%;
            max-width: 600px;
            padding: 10px;
            border: none;
            border-radius: 5px;
            resize: none;
            font-size: 1em;
            background-color: #444c56;
            color: #ffffff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s;
        }

        textarea::placeholder {
            color: #888;
        }

        textarea:focus {
            outline: none;
            background-color: #555;
        }

        button {
            margin-top: 15px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: #61dafb;
            color: #282c34;
            font-size: 1em;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
        }

        button:hover {
            background-color: #21a1f1;
            transform: scale(1.05);
        }

		#response {
            margin-top: 20px;
            padding: 10px;
            width: 80%;
            max-width: 600px;
            max-height: 300px; /* Set a maximum height */
            border-radius: 5px;
            background-color: #444c56;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: none; /* Initially hidden */
            overflow-y: auto; /* Enable vertical scrolling */
        }

		#copyBtn {
            margin-top: 10px;
            background-color: #61dafb; /* Green */
        }

        #copyBtn:hover {
            background-color: #21a1f1; /* Darker green */
        }
    </style>
</head>

<body>
    <h2>Deep Seek VS Code Extension</h2>
    <textarea name="prompt" id="prompt" rows="3" placeholder="Ask Something........"></textarea>
    <button id="askBtn">Ask</button>
    <div id="response"></div>
	<button id="copyBtn" style="display: none;">Copy</button>
    
    <script>
        const vscode = acquireVsCodeApi();

        document.getElementById('askBtn').addEventListener('click', () => {
            const text = document.getElementById('prompt').value;
            vscode.postMessage({ command: 'chat', text });
        });

        window.addEventListener('message', event => {
            const { command, text } = event.data;
            if (command === 'chatResponse') {
                const responseDiv = document.getElementById('response');
                responseDiv.innerText = text;
                responseDiv.style.display = 'block'; // Show the response
				document.getElementById('copyBtn').style.display = 'inline-block'; // Show the copy button
            }
        });

		document.getElementById('copyBtn').addEventListener('click', () => {
            const responseText = document.getElementById('response').innerText;
            navigator.clipboard.writeText(responseText).then(() => {
                alert('Response copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    </script>
</body>

</html>

`;
}

// This method is called when your extension is deactivated
export function deactivate() { }
