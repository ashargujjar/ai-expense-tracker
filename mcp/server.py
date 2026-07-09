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
                    "totalAmount": {"type": "number"},
                    "receiptId": {"type": "string"},
                    "jwt": {"type": "string"},
                },
                "required": ["items", "totalItems", "totalAmount", "receiptId", "jwt"],
            },
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name != "save_expense":
        raise ValueError(f"Unknown tool: {name}")

    try:
        items = arguments["items"]
        total_items = arguments["totalItems"]
        total_amount = arguments["totalAmount"]
        receipt_id = arguments["receiptId"]
        jwt = arguments["jwt"]
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
                },
                headers={"Authorization": f"Bearer {jwt}"},
            )
            resp.raise_for_status()

        return [types.TextContent(type="text", text="Expense saved")]

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