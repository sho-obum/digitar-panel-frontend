import { NextResponse } from "next/server";

export async function POST(req:Request){
    try {
        const {text} = await req.json()
        const apiKey = process.env.GEMINI_API_KEY;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,{
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents:[{parts:[{text:`REWRITE THIS EMAIL MORE PROFESSIONALLY: ${text} `}]}],
            }),
        }) 

        const data = await res.json();
        const rewrittenText = data.candidates[0].content.parts[0]?.text??"Failed to rewrite the email.";
        return NextResponse.json({rewrittenText});

    } catch (error) {
        console.error("Error rewriting email:", error);
        return NextResponse.json({error:"Internal Server Error"}, {status:500});
        
    }
}