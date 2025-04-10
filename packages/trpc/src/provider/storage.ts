import path from "path";
import fs from "fs";
import { z } from "zod";

const DATA_FILE_PATH = path.join("/Users/luke/Documents/project/mcp/apps/mcp-server/dist", 'data.json');




const GlobalDataSchema = z.object({
    privateKey: z.string(),
    password: z.string(),
});


export const setGlobalData = (data: z.infer<typeof GlobalDataSchema>) => {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
}

export const getGlobalData = () => {
    if (!fs.existsSync(DATA_FILE_PATH)) {
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({
            privateKey: '',
            password: '',
        }, null, 2));
    }
    
    return GlobalDataSchema.parse(JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8')));
}
