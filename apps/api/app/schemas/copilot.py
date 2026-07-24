from datetime import datetime

from pydantic import BaseModel


class CopilotEvidence(BaseModel):
    label: str
    value: str


class CopilotAction(BaseModel):
    label: str
    href: str


class CopilotBriefing(BaseModel):
    generated_at: datetime
    headline: str
    summary: str
    priority: str
    confidence: str
    actions: list[CopilotAction]
    evidence: list[CopilotEvidence]
