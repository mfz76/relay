# Relay

AI-powered customer support workflow automation
Relay is a customer-support automation project designed to analyze
incoming inquiries and route them to the right business actions. It uses
AI to classify each message by priority, category, and sentiment,
then triggers workflow actions such as team notifications and
record-keeping.


Why Relay?

Support teams often spend time reading, categorizing, prioritizing, and
forwarding incoming requests. Relay aims to automate that repetitive
work so urgent issues can be surfaced quickly and other inquiries can be
logged consistently.
Key capabilities
- AI-assisted classification --- analyze inquiries for priority,
  category, and sentiment using the Gemini API.
- Conditional routing --- select actions based on the
  classification.
- Slack notifications --- send alerts to a configured Slack
  channel.
- Internal email notifications --- notify the support team through
  Gmail SMTP; the intended use is internal team communication, not
  customer-facing email.
- Google Sheets logging --- record inquiry details and
  classification results.
- Google Calendar integration --- support creating calendar events
  for follow-up when configured.
- Visual workflow-builder direction --- the intended
  business-facing experience is a visual, drag-and-drop workflow
  builder inspired by automation platforms such as Zapier. Confirm
  which builder features are implemented in the current frontend.
  
  
Workflow overview

Customer inquiry
      |
      v
FastAPI backend
      |
      v
Gemini analysis
(priority, category, sentiment)
      |
      v
Conditional routing
      |
      +---- High priority ----> Slack alert
      |                         Internal Gmail notification
      |                         Optional Calendar follow-up
      |
      +---- Low / medium -----> Google Sheets record
      
The exact routing rules should match the implementation in the current
codebase. Consider requiring human approval before automatically
scheduling meetings.


Technology and integrations

  Component                 Purpose
  FastAPI                   Backend API for receiving and processing inquiries
  Google Gemini API         AI classification
  Slack Incoming Webhooks   Team alerts
  Gmail SMTP                Internal email notifications
  Google Sheets API         Inquiry logging
  Google Calendar API       Calendar follow-up actions
  


Project goals

Relay aims to make customer-support operations more responsive by
combining AI classification with practical workflow automation in tools
teams already use.


License

No license has been specified. 


