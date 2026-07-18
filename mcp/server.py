import logging
import httpx
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.responses import Response
import mcp.types as types
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("my-simple-server")

server = Server("my-simple-server")

jwtSchema={
                "type": "object",
                "properties":{
                   "jwt":{"type":"string", "description": "JWT token for user authentication"} 
                },
                "required":["jwt"]
            }
@server.list_tools()
async def list_tools():
    return [
        types.Tool(
            name="save_expense",
            description="Save a parsed receipt (all line items) to the backend",
            inputSchema={
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "price": {"type": "number"},
                                "category": {"type": "string"},
                                "quantity": {"type": "integer"},
                                "total": {"type": "number"},
                            },
                            "required": ["name", "price", "category", "quantity", "total"],
                        },
                    },
                    "totalItems": {"type": "integer"},
                    "shop_name": {"type": "string"},
                    "totalAmount": {"type": "number"},
                    "receiptId": {"type": "string"},
                    "jwt": {"type": "string"},
                },
                "required": ["items", "totalItems", "totalAmount", "receiptId", "jwt","shop_name"],
            },
        ),
        types.Tool(
            name="get_total_spendings",
            description="get the total all spendings",
            inputSchema=jwtSchema
        ),
        types.Tool(
          name="get_budget_limit",
          description="get the total monthly limit of user",
          inputSchema=jwtSchema
        ),
        types.Tool(
        name="set_budget_limit",
        description="set the total monthly limit of user",
        inputSchema={
            "type": "object",
            "properties": {
                "limit": {"type": "number"},
                "jwt": {"type": "string"},
            },
            "required": ["limit", "jwt"],
            }    
        ),
        types.Tool(
           name="get_monthly_spendings",
           description="get the total monthly spendings of user",
           inputSchema=jwtSchema
        ),
        types.Tool(
            name="get_highest_spendings",
            description="get the highest spendings of user",
            inputSchema=jwtSchema
        ),
        types.Tool(
            name="get_categorywise_spendings",
            description="get the average spending by category of user",
            inputSchema=jwtSchema
        ),
        types.Tool(
            name="get_remaining_budget",
            description="get the remaining budget of user",
            inputSchema=jwtSchema
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict):    
    try:
        if name=="save_expense":
            items = arguments["items"]
            total_items = arguments["totalItems"]
            total_amount = arguments["totalAmount"]
            receipt_id = arguments["receiptId"]
            jwt = arguments["jwt"]
            shop_name = arguments["shop_name"]
            print(items,total_items,total_amount)
            logger.info("receiptId=%s totalAmount=%s totalItems=%s", receipt_id, total_amount, total_items)

            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "http://backend:5000/api/expense",
                    json={
                        "items": items,
                        "totalItems": total_items,
                        "totalAmount": total_amount,
                        "receiptId": receipt_id,
                        "shop_name": shop_name, 
                    },
                    headers={"Authorization": f"Bearer {jwt}"},
                )

                resp.raise_for_status()

            return [types.TextContent(type="text", text="Expense saved")]
        elif name == "get_total_spendings":
            jwt=arguments["jwt"]
            async with httpx.AsyncClient() as client:
                resp=await client.get("http://backend:5000/api/total",
                                      headers={"Authorization":f"Bearer {jwt}"})
                resp.raise_for_status()
                data=resp.json()
                return [types.TextContent(type="text",text=f"total expense fetched {data}")]
        elif name == "get_budget_limit":
            jwt=arguments["jwt"]
            async with httpx.AsyncClient() as client:
                resp=await client.get("http://backend:5000/api/budget/limit",
                                      headers={"Authorization":f"Bearer {jwt}"})
                resp.raise_for_status()
                data=resp.json()
                return [types.TextContent(type="text",text=f"budget limit fetched {data}")]
        elif name == "set_budget_limit":
            jwt=arguments["jwt"]
            limit=arguments["limit"]
            async with httpx.AsyncClient() as client:
                resp=await client.post("http://backend:5000/api/budget",
                                      json={"limit":limit},
                                      headers={"Authorization":f"Bearer {jwt}"})
                resp.raise_for_status()
                data=resp.json()
                return [types.TextContent(type="text",text=f"budget limit set {data}")]
        elif name == "get_monthly_spendings":
            jwt=arguments["jwt"]
            async with httpx.AsyncClient() as client:
                resp=await client.get("http://backend:5000/api/monthly",
                                      headers={"Authorization":f"Bearer {jwt}"})
                resp.raise_for_status()
                data=resp.json()
                return [types.TextContent(type="text",text=f"monthly spendings fetched {data}")]
        elif name == "get_highest_spendings":
            jwt=arguments["jwt"]
            async with httpx.AsyncClient() as client:
                resp=await client.get("http://backend:5000/api/highest",
                                      headers={"Authorization":f"Bearer {jwt}"})
                resp.raise_for_status()
                data=resp.json()
                return [types.TextContent(type="text",text=f"highest spendings fetched {data}")]
        elif name == "get_categorywise_spendings":
            jwt=arguments["jwt"]
            async with httpx.AsyncClient() as client:
                resp=await client.get("http://backend:5000/api/categorywise",
                                      headers={"Authorization":f"Bearer {jwt}"})
                resp.raise_for_status()
                data=resp.json()
                return [types.TextContent(type="text",text=f"categorywise spendings fetched {data}")]
        elif name == "get_remaining_budget":
            jwt=arguments["jwt"]
            async with httpx.AsyncClient() as client:
                resp=await client.get("http://backend:5000/api/remaining/budget",
                                      headers={"Authorization":f"Bearer {jwt}"})
                resp.raise_for_status()
                data=resp.json()
                return [types.TextContent(type="text",text=f"remaining budget fetched {data}")] 


    except KeyError as e:
        return [types.TextContent(type="text", text=f"Missing argument: {e}")]
    except httpx.HTTPStatusError as e:
        logger.exception("Backend returned error")
        return [types.TextContent(type="text", text=f"Backend error: {e.response.status_code} {e.response.text}")]
    except Exception as e:
        logger.exception("save_expense failed")
        return [types.TextContent(type="text", text=f"Error saving expense: {e}")]


sse = SseServerTransport("/messages/")


async def handle_sse(request):
    async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
        await server.run(streams[0], streams[1], server.create_initialization_options())
    return Response()


app = Starlette(
    routes=[
        Route("/sse", endpoint=handle_sse),
        Mount("/messages/", app=sse.handle_post_message),
    ]
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)