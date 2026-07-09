from dotenv import load_dotenv
import os
import base64
from typing import List
from pydantic import BaseModel,Field
from langchain.tools import tool
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from datetime import datetime

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
Extract the receipt.
and return the structured output syntax provided to you
If quantity is missing, assume it is 1.
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




AI_expense_agent = create_agent(
    model=model,
    tools=[image_ocr],
    system_prompt="""
You are an AI Expense Tracker assistant.

Rules:

1. Help users understand and manage their expenses.
2. If the user provides a receipt image path, ALWAYS use the image_ocr tool.
3. Never guess receipt contents.
4. Return the structured receipt extracted by the tool.
5. Answer questions about budgeting, savings, spending habits, and expenses.
6. If the question is unrelated to expenses, politely say you only assist with expense tracking.
"""
)

