from fastapi import FastAPI
from pydantic import BaseModel
from agents.agent import get_agent
from fastapi.responses import JSONResponse
app=FastAPI()
class OCRRequest(BaseModel):
    receiptId: str
    imagePath: str
    jwt:str
class chat(BaseModel):
    message:str
    jwt:str
agent = None

@app.on_event("startup")
async def startup():
    global agent
    agent = await get_agent()

@app.post("/ocr")
async def generate_Reciept(request: OCRRequest):
    print("receiptId",request.receiptId)
    print("imagePath",request.imagePath)
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

@app.post("/chat")
async def chat(request:chat):
    try:
        print("message",request.message)
        result=await agent.ainvoke(
            {
                "messages":[
                    {
                        "role":"user",
                        "content":f"""{request.message} jwt:{request.jwt}""" 
                    }
                ]
            }
        )
        return JSONResponse(status_code=200,content={
            "success":True,
            "response":result["messages"][-1].content
        })
    except Exception as e:
        return JSONResponse(status_code=500,content={
            "success":False,
            "error":str(e)
        })





