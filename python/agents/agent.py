from dotenv import load_dotenv
import os
import base64
from typing import List
from pydantic import BaseModel,Field
from langchain.tools import tool
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
load_dotenv()



model = ChatOpenAI(
    model="gpt-4o-mini",  # Replace if needed
    api_key=os.getenv("OPENAI_KEY"),
)

class ExpenseItem(BaseModel):
    name: str = Field(description="Name of the purchased item")
    price: float = Field(description="Price of a single item")
    category: str = Field(description="Category of the item")
    quantity: int = Field(description="Quantity purchased")
    total: float = Field(description="price * quantity")

class ExpenseReceipt(BaseModel):
    shop_name: str = Field(description="Name of the shop")
    items: List[ExpenseItem]
    totalItems: int
    totalAmount: float


vision_model = model.with_structured_output(ExpenseReceipt)


@tool
def image_ocr(image_path: str) -> dict:
    """
    Extract structured information from a receipt image.

    Args:
        image_path: Absolute or relative path to the receipt image.

    Returns:
        Structured receipt as a dictionary.
    """

    if not os.path.exists(image_path):
        return {"error": f"Image not found: {image_path}"}

    with open(image_path, "rb") as image:
        image_b64 = base64.b64encode(image.read()).decode("utf-8")

    message = HumanMessage(
    content=[
        {
            "type": "text",
            "text": """
Extract the receipt and return the structured output as specified.

Rules:
- If quantity is missing, assume it is 1.
- Every item MUST be assigned a category. Do not use "Unknown" unless the item name is completely illegible.
- Choose the most specific matching category from this list:
  Bakery, Dairy, Produce, Meat & Poultry, Grains & Rice, Spices & Condiments,
  Beverages, Snacks, Household Cleaning, Personal Care, Kitchenware, Service Fee, Other
- Use your general knowledge of common grocery/retail items to infer the category
  even if the item name is abbreviated, misspelled, or in another language
  (e.g. "Adrak" = ginger -> Produce, "Dalda Cooking Oil" -> Kitchen/Cooking, "Harpic" -> Household Cleaning).
- "total" must equal price * quantity. If OCR-detected total conflicts with price*quantity,
  trust the printed total on the receipt but flag it as-is (do not silently recompute).
"""
        },
        {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{image_b64}"
            }
        }
    ]
)

    receipt = vision_model.invoke([message])

    return receipt.model_dump()


async def get_agent():

    client = MultiServerMCPClient(
    {
        "expense": {
        "transport": "sse",
        "url": "http://mcp:8001/sse"
    }
    }
)

    mcp_tools = await client.get_tools()

    AI_expense_agent = create_agent(
        model=model,
        tools=[
            image_ocr,
            *mcp_tools
        ],
        system_prompt="""
You are an AI Expense Tracker assistant. whose role is to manage the user expenses 
give the user information about their queries from the available information. do not 
go ahead of any whose information is not provided to you. use the required tool to fetch 
those informations saving information all work that need to be done.
"""
    )

    return AI_expense_agent