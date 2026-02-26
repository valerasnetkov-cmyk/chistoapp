from blockrun_llm import setup_agent_wallet
client = setup_agent_wallet()
print(f"Balance: ${client.get_balance():.2f}")
