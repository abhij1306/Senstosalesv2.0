"""
FastAPI Main Application
Production Configuration
"""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings as app_settings
from app.core.exceptions import AppException

# Import Routers
from app.routers import (
    buyers,
    common,
    dashboard,
    dc,
    health,
    invoice,
    po,
    po_notes,
    reports,
    search,
    settings,
    srv,
    system,
)

# Setup structured logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=app_settings.PROJECT_NAME, description="SenstoSales ERP API", version="3.4.0")

# CORS Configuration
# Simplified for development to resolve connectivity issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """
    Global handler for application-specific exceptions.
    Returns standardized response based on exception properties.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "error_code": exc.error_code,
            "details": exc.details,
        },
    )


from app.core.exceptions import ResourceNotFoundException


@app.exception_handler(ResourceNotFoundException)
async def resource_not_found_handler(request: Request, exc: ResourceNotFoundException):
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "message": exc.message,
            "error_code": exc.error_code,
            "details": exc.details,
        },
    )


# Include Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(common.router, tags=["Common"])  # No prefix - already has /api/common
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(po.router, prefix="/api/po", tags=["Purchase Orders"])
app.include_router(dc.router, prefix="/api/dc", tags=["Delivery Challans"])
app.include_router(invoice.router, prefix="/api/invoice", tags=["Invoices"])
app.include_router(srv.router, prefix="/api/srv", tags=["SRVs"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(buyers.router, prefix="/api/buyers", tags=["Buyers"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(system.router, tags=["System"])  # Prefix defined in router
app.include_router(po_notes.router, prefix="/api/po-notes", tags=["PO Notes"])


@app.get("/")
def root():
    return {"status": "active", "version": "3.4.0"}
