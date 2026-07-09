import asyncio
from mcp.server import Server
import mcp.server.stdio
import mcp.types as types

server = Server("my-simple-server")


@server.list_tools()
async def list_tools():
    return [
        types.Tool(
            name="save_expense",
            description="Save an expense to the backend",
            inputSchema={
                "type": "object",
                "properties": {
                    "expense": {
                        "type": "object"
                    },
                    "receiptId": { "type": "string" },
                    "jwt": { "type": "string" }
                },
                "required": [
                      "expense",
                      "receiptId",
                      "jwt"
                          ]            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
  if name=="save_expense":
    expense=arguments.get("expense")
    print(expense)

    return [
      types.TextContent(type="text",text="Expense saved")
    ]

async def main():
  async with mcp.server.stdio.stdio_server() as (read,write):
    await server.run(read,write,None)

if __name__ == "__main__":
    asyncio.run(main())