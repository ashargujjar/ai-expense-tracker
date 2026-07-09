from fastapi import FastAPI
from pydantic import BaseModel
from agents.agent import AI_expense_agent as agent
app=FastAPI()
class OCRRequest(BaseModel):
    receiptId: str
    imagePath: str
    jwt:str

@app.post("/ocr")
def generate_Reciept(request: OCRRequest):
    print(request.receiptId)
    print(request.imagePath)
    result = agent.invoke(
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

