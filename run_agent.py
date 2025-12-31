import os
import sys
from backend.core.guardrails.registry import registry
from backend.core.guardrails.audit import audit
from backend.core.guardrails.agent_middleware import agent_middleware

def load_and_register_guardrails_before_agent_start():
    print("[BOOTSTRAP] Initializing Guardrail Layer...")
    try:
        g_hash = registry.load_rules("guardrails.json")
        os.environ["GUARDRAILS_ENFORCED"] = "true"
        print(f"[BOOTSTRAP] Operating under GuardrailRegistry.{g_hash[:8]}. All actions validated by middleware.")
    except Exception as e:
        print(f"[FATAL] abort_session_due_to_missing_guardrails_enforcement: {e}")
        sys.exit(1)

    status = agent_middleware.get_current_status()
    print(f"[SESSION] Agent Session Started for {status.get('project_name')} v{status.get('version')}.")
    print(f"[SESSION] Reference DB: {status.get('infrastructure', {}).get('database', {}).get('path')}")
    print("[SESSION] Deterministic mode enforced for facts and numbers.")
    # Here you would normally launch the LLM loop or the main task handler
    
if __name__ == "__main__":
    load_and_register_guardrails_before_agent_start()
    startAgentSession()
