from fastapi import FastAPI
from pydantic import BaseModel
from agents.agent import get_agent
app=FastAPI()
class OCRRequest(BaseModel):
    receiptId: str
    imagePath: str
    jwt:str

agent = None

@app.on_event("startup")
async def startup():
    global agent
    agent = await get_agent()

@app.post("/ocr")
async def generate_Reciept(request: OCRRequest):
    print(request.receiptId)
    print(request.imagePath)
    result =await agent.ainvoke(
      {
          "messages": [
              {
                "role": "user",
                "content": f"""
            Extract the receipt from {request.imagePath}
            and save it.
            ReceiptId: {request.receiptId}
            jwt:{request.jwt}
            """
              }
          ]
      }
  )

    print(result)

