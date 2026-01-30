import streamlit as st
import pandas as pd
import numpy as np
import os
import tempfile
import warnings
import time
import json
import re
import copy
from datetime import datetime
from dotenv import load_dotenv

# --- VISUALIZATION ---
import plotly.express as px
import plotly.graph_objects as go

# --- LANGCHAIN & AI ---
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document

# --- CONFIGURATION ---
warnings.filterwarnings("ignore")
st.set_page_config(
    page_title="WealthWise AI | Omni-Channel Financial Model",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="🏦"
)
load_dotenv()

# ==============================================================================
# 🧠 KNOWLEDGE BASE (PORTED FROM WEALTHWISE JS)
# ==============================================================================

INVESTMENT_SCHEMES = {
    # --- GOVERNMENT ---
    "ppf": {
        "name": "Public Provident Fund (PPF)",
        "type": "Government",
        "risk": "Very Low",
        "roi": 7.1,
        "lock_in": "15 Years",
        "tax_status": "EEE (Exempt-Exempt-Exempt)",
        "desc": "Government-backed, completely safe. Tax-free returns. Best for long-term safety.",
        "min": 500, "max": 150000
    },
    "nps": {
        "name": "National Pension System (NPS)",
        "type": "Government",
        "risk": "Low-Moderate",
        "roi": 10.5, # Avg hist
        "lock_in": "Age 60",
        "tax_status": "EET (Partial Tax on Exit)",
        "desc": "Pension scheme with equity exposure. Extra ₹50k tax deduction u/s 80CCD(1B).",
        "min": 500, "max": "Unlimited"
    },
    "ssy": {
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "type": "Government",
        "risk": "Very Low",
        "roi": 8.2,
        "lock_in": "21 Years (Girl Child only)",
        "tax_status": "EEE",
        "desc": "Highest rate among government schemes. Specifically for girl child's future.",
        "min": 250, "max": 150000
    },
    
    # --- EQUITY ---
    "index_fund": {
        "name": "Index Fund (Nifty 50)",
        "type": "Mutual Fund",
        "risk": "Moderate",
        "roi": 12.5, # Hist avg
        "lock_in": "None",
        "tax_status": "LTCG > 1L taxed at 12.5%",
        "desc": "Low-cost market matching returns. Best starting point for equity.",
        "min": 500, "max": "Unlimited"
    },
    "elss": {
        "name": "ELSS Tax Saver Fund",
        "type": "Mutual Fund",
        "risk": "High",
        "roi": 14.0,
        "lock_in": "3 Years",
        "tax_status": "LTCG > 1L taxed at 12.5% (80C Benefit)",
        "desc": "Shortest lock-in tax saver. High growth potential with volatility.",
        "min": 500, "max": "Unlimited"
    },
    
    # --- GOLD ---
    "sgb": {
        "name": "Sovereign Gold Bond (SGB)",
        "type": "Gold",
        "risk": "Moderate",
        "roi": 11.0, # Gold Rate + 2.5%
        "lock_in": "8 Years",
        "tax_status": "Tax Free on Maturity",
        "desc": "Gold appreciation + 2.5% fixed interest. Best way to own gold.",
        "min": 4800, "max": "4KG"
    },
    
    # --- FIXED INCOME ---
    "fd": {
        "name": "Bank Fixed Deposit",
        "type": "Fixed Income",
        "risk": "Very Low",
        "roi": 7.0,
        "lock_in": "Flexible",
        "tax_status": "Fully Taxable",
        "desc": "Guaranteed returns, chemically pure safety. Returns barely beat inflation.",
        "min": 1000, "max": "Unlimited"
    }
}

PERSONA_PROMPTS = {
   "CFP": """You are a Certified Financial Planner (CFP). 
   Focus: Holistic health, risk management, retirement, and safety.
   Tone: Professional, empathetic, cautious.
   KPIs: Emergency Fund coverage, Debt-to-Income Ratio, Insurance adequacy.""",
   
   "Growth": """You are a Hedge Fund Growth Analyst.
   Focus: Maximizing Alpha, aggressive equity allocation, compound growth.
   Tone: Analytical, direct, focused on ROI.
   KPIs: Portfolio Beta, CAGR, Asset Allocation (Equity %).""",
   
   "Tax": """You are a Senior Tax Strategist.
   Focus: Tax efficiency, 80C/80D utilization, Tax Loss Harvesting.
   Tone: Technical, precise, regulatory-focused.
   KPIs: Taxable Income, Deductions Utilized, Post-Tax Returns.""",
   
   "Frugal": """You are a 'FIRE' (Financial Independence, Retire Early) Coach.
   Focus: Savings rate, cutting expenses, minimalism, freedom.
   Tone: Strict, practical, no-nonsense.
   KPIs: Savings Rate (%), Expense Leakage, Burn Rate.""",
   
   "Psych": """You are a Behavioral Finance Expert.
   Focus: Biases (Loss Aversion, FOMO), decision frameworks, mental models.
   Tone: Psychological, thoughtful, probing.
   KPIs: Impulse Buy Frequency, Decision Confidence Score."""
}

# ==============================================================================
# 🎨 UI & STYLING
# ==============================================================================

st.markdown("""
<style>
    /* OMNI-CHANNEL PREMIUM THEME */
    .stApp {
        background: radial-gradient(circle at 10% 20%, rgb(15, 23, 42) 0%, rgb(18, 18, 18) 90%);
        color: #e0e7ff;
    }
    
    /* SIDEBAR */
    [data-testid="stSidebar"] {
        background-color: #0b0f15;
        border-right: 1px solid #1e293b;
    }
    
    /* CARDS */
    .kpi-card {
        background: rgba(30, 41, 59, 0.4);
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 15px;
        text-align: center;
        backdrop-filter: blur(5px);
        transition: transform 0.2s;
    }
    .kpi-card:hover {
        transform: translateY(-2px);
        border-color: #6366f1;
    }
    .kpi-value { font-size: 2em; font-weight: bold; color: #818cf8; }
    .kpi-label { font-size: 0.8em; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    
    /* SCHEME CARD */
    .scheme-card {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%);
        border-left: 4px solid #10b981;
        padding: 15px;
        margin-bottom: 0px;
        border-radius: 6px;
    }
    .scheme-name { color: #10b981; font-weight: bold; font-size: 1.1em; }
    .scheme-tag { 
        background-color: rgba(16, 185, 129, 0.2); color: #6ee7b7; 
        padding: 2px 8px; border-radius: 4px; font-size: 0.7em; margin-left: 10px;
    }
    
    /* CHAT */
    .stChatMessage { border-radius: 12px; border: 1px solid #334155; }
    
    /* HEADERS */
    h1, h2, h3 { color: #c4b5fd !important; }
    
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 🛠️ UTILITY FUNCTIONS
# ==============================================================================

def get_api_key():
    key = st.sidebar.text_input("🔑 Groq API Key", type="password")
    return key if key else os.getenv("GROQ_API_KEY")

def llm_engine(prompt, api_key, sys_prompt="You are a helpful assistant.", model="llama-3.3-70b-versatile"):
    if not api_key: return "⚠️ Please provide an API Key."
    try:
        chat = ChatGroq(model=model, api_key=api_key, temperature=0.2)
        response = chat.invoke(f"SYSTEM: {sys_prompt}\n\nUSER: {prompt}")
        return response.content
    except Exception as e:
        return f"❌ Error: {str(e)}"

@st.cache_resource
def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def ingest_document(uploaded_file):
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{uploaded_file.name.split('.')[-1]}") as tmp:
        tmp.write(uploaded_file.getvalue())
        path = tmp.name
    
    try:
        if path.endswith(".pdf"):
            loader = PyPDFLoader(path)
            docs = loader.load()
        elif path.endswith(".csv"):
            df = pd.read_csv(path)
            text = df.to_string()
            docs = [Document(page_content=text, metadata={"source": uploaded_file.name})]
        
        # RAG 2.0 OPTIMIZATION: Larger chunks for financial context
        splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
        chunks = splitter.split_documents(docs)
        vectorstore = FAISS.from_documents(chunks, get_embeddings())
        return vectorstore
    except Exception as e:
        st.error(f"Ingestion Error: {e}")
        return None

# ==============================================================================
# 🎯 MAIN APPLICATION
# ==============================================================================

def main():
    if "kb" not in st.session_state: st.session_state.kb = {}
    if "messages" not in st.session_state: st.session_state.messages = []
    
    api_key = get_api_key()
    
    # --- SIDEBAR: IDENTITY & DATA ---
    with st.sidebar:
        st.title("🏦 WealthWise")
        st.caption("Omni-Channel Financial Model")
        
        st.markdown("### 🎭 Active Persona")
        persona = st.selectbox("Who is analyzing?", ["CFP", "Growth", "Tax", "Frugal", "Psych"], index=0)
        st.info(f"**Role:** {persona}\n\n_System will adapt KPIs and Advice based on this role._")
        
        st.markdown("### 📁 Financial Data")
        uploads = st.file_uploader("Upload Statements (PDF/CSV)", accept_multiple_files=True)
        if uploads:
            for f in uploads:
                if f.name not in st.session_state.kb:
                    with st.spinner(f"Indexing {f.name}..."):
                        vs = ingest_document(f)
                        if vs: st.session_state.kb[f.name] = vs
            st.success(f"Knowledge Base: {len(st.session_state.kb)} Sources")
            
    # --- DYNAMIC DASHBOARD ---
    st.markdown(f"# 📊 Command Center ({persona} View)")
    
    # KPIs adapt based on Persona
    col1, col2, col3, col4 = st.columns(4)
    
    if persona == "CFP":
        kpis = [("Safety Score", "85/100", "+5"), ("Free Cash Flow", "₹1.2L", "+12%"), ("Debt-to-Income", "12%", "-2%"), ("Insured", "Yes", "Stable")]
    elif persona == "Growth":
        kpis = [("Portfolio Alpha", "4.2", "+0.3"), ("Equity Alloc", "75%", "+5%"), ("Beta", "1.15", "High"), ("CAGR", "14%", "+1%")]
    elif persona == "Tax":
        kpis = [("Taxable Income", "₹12.5L", "High"), ("80C Utilized", "100%", "Max"), ("Tax Harv.", "₹45k", "New"), ("Eff. Rate", "18%", "-2%")]
    elif persona == "Frugal":
        kpis = [("Savings Rate", "42%", "+10%"), ("Burn Rate", "₹35k/mo", "-5k"), ("Leakage", "₹4.2k", "-1k"), ("Freedom Date", "2032", "-6mo")]
    else: # Psych
        kpis = [("Impulse Buys", "2", "-3"), ("Confidence", "High", "Stable"), ("FOMO Score", "2/10", "Low"), ("Clarity", "High", "Stable")]

    for i, (label, val, delta) in enumerate(kpis):
        with [col1, col2, col3, col4][i]:
            st.metric(label=label, value=val, delta=delta)
            
    st.divider()
    
    tab_iq, tab_rec, tab_war, tab_sim, tab_squad = st.tabs([
        "🧠 Financial IQ (RAG)", 
        "💡 Investment Engine", 
        "⚔️ War Room", 
        "🔮 Wealth Simulator",
        "🤖 Agent Squad"
    ])
    
    # === TAB 1: RAG 2.0 INTELLIGENCE ===
    with tab_iq:
        st.markdown("### 🔍 Document Intelligence (RAG 2.0)")
        st.caption(f"Analyze your uploaded documents using the **{persona}** perspective. Now with Citations.")
        
        # Chat History
        for msg in st.session_state.messages:
            with st.chat_message(msg['role']): st.markdown(msg['content'])
            
        if prompt := st.chat_input(f"Ask the {persona} about your finances..."):
            st.session_state.messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"): st.markdown(prompt)
            
            with st.spinner("Analyzing Knowledge Base..."):
                # 1. Retrieve
                docs = []
                context = ""
                if st.session_state.kb:
                    merged = copy.deepcopy(list(st.session_state.kb.values())[0])
                    for v in list(st.session_state.kb.values())[1:]: merged.merge_from(v)
                    docs = merged.as_retriever(search_kwargs={"k": 5}).invoke(prompt)
                    context = "\n\n".join([f"SOURCE ({d.metadata.get('source', 'Unknown')}): {d.page_content}" for d in docs])
                
                # 2. Augmented Generation
                citation_prompt = f"""
                STRICT CONTEXT PROTOCOL:
                You are a Financial Forensic Analyst. Answer ONLY using the provided Context.
                If the answer is not in the context, say "I cannot find this in your documents."
                
                CITATION REQUIREMENT:
                - Use [Source: Filename] tags for every claim.
                - Be extremely precise with numbers.
                
                CONTEXT:
                {context}
                
                {PERSONA_PROMPTS.get(persona)}
                """
                
                ans = llm_engine(prompt, api_key, sys_prompt=citation_prompt)
                
                st.session_state.messages.append({"role": "assistant", "content": ans})
                with st.chat_message("assistant"): 
                    st.markdown(ans)
                    if docs:
                        with st.expander("🔍 Verified Sources (Forensic Data)"):
                            for i, d in enumerate(docs):
                                st.markdown(f"**Chunk {i+1} from {d.metadata.get('source')}**")
                                st.code(d.page_content[:300] + "...")
    
    # === TAB 2: INVESTMENT ENGINE (Rule-Based + AI) ===
    with tab_rec:
        st.markdown("### 🎯 Smart Recommendations")
        
        c_risk, c_inv = st.columns([1, 2])
        
        with c_risk:
            st.markdown("#### Filter Options")
            risk_prof = st.select_slider("Risk Tolerance", ["Low", "Moderate", "High", "Very High"], value="Moderate")
            amount = st.number_input("Monthly Investment (₹)", 1000, 1000000, 10000)
            goal = st.selectbox("Goal", ["Wealth Creation", "Tax Saving", "Retirement", "Emergency Fund"])
            
            if st.button("Generate Plan"):
                # RULE-BASED LOGIC (Ported from WealthWise JS)
                recs = []
                
                # Goal-Based Rules
                if goal == "Tax Saving":
                    recs.append(INVESTMENT_SCHEMES["ppf"])
                    recs.append(INVESTMENT_SCHEMES["elss"])
                    recs.append(INVESTMENT_SCHEMES["nps"])
                elif goal == "Emergency Fund":
                    recs.append(INVESTMENT_SCHEMES["fd"])
                elif goal == "Retirement":
                    recs.append(INVESTMENT_SCHEMES["nps"])
                    recs.append(INVESTMENT_SCHEMES["ppf"])
                else: # Wealth
                    recs.append(INVESTMENT_SCHEMES["index_fund"])
                    recs.append(INVESTMENT_SCHEMES["sgb"])
                    if risk_prof in ["High", "Very High"]:
                        recs.append(INVESTMENT_SCHEMES["elss"])
                
                # Display Results
                st.session_state.current_recs = recs
        
        with c_inv:
            if "current_recs" in st.session_state:
                st.markdown(f"#### Recommended Portfolio for {risk_prof} Risk")
                total_amt = amount
                
                for scheme in st.session_state.current_recs:
                    # Simple equal allocation for demo
                    alloc = int(total_amt / len(st.session_state.current_recs))
                    
                    st.markdown(f"""
                    <div class='scheme-card'>
                        <div style='display:flex; justify-content:space-between;'>
                            <span class='scheme-name'>{scheme['name']}</span>
                            <span style='color:#fff; font-weight:bold;'>₹{alloc:,}/mo</span>
                        </div>
                        <div style='margin-top:5px; margin-bottom:10px;'>
                            <span class='scheme-tag'>Risk: {scheme['risk']}</span>
                            <span class='scheme-tag'>Exp Return: {scheme['roi']}%</span>
                            <span class='scheme-tag'>{scheme['type']}</span>
                        </div>
                        <div style='font-size:0.9em; color:#cbd5e1;'>{scheme['desc']}</div>
                        <div style='font-size:0.8em; color:#94a3b8; margin-top:5px;'>
                            🔒 Lock-in: {scheme['lock_in']} | 📄 Tax: {scheme['tax_status']}
                        </div>
                    </div>
                    <br>
                    """, unsafe_allow_html=True)
                
                # AI Insight Bubble
                st.info(f"💡 **AI Insight:** Given your {risk_prof} profile, this mix balances {st.session_state.current_recs[0]['name']} for stability with growth assets. Start with small SIPs.")

    # === TAB 3: WAR ROOM (Multi-Agent Debate) ===
    with tab_war:
        st.markdown("### ⚔️ Strategic Decision Council")
        st.write("Unsure? Let two opposing experts debate your dilemma.")
        
        d_col1, d_col2 = st.columns(2)
        with d_col1:
            p1 = st.selectbox("Proponent 1", list(PERSONA_PROMPTS.keys()), index=1) # Growth
            arg1 = st.text_input("Option A", "Invest in Crypto")
        
        with d_col2:
            p2 = st.selectbox("Proponent 2", list(PERSONA_PROMPTS.keys()), index=0) # CFP
            arg2 = st.text_input("Option B", "Pay off Home Loan")
            
        if st.button("🔥 Convene Debate"):
            with st.spinner("The Council is deliberating..."):
                prompt = f"""
                DEBATE TOPIC: {arg1} VS {arg2}
                
                PERSONA A ({p1}): {PERSONA_PROMPTS[p1]}
                PERSONA B ({p2}): {PERSONA_PROMPTS[p2]}
                
                INSTRUCTIONS:
                1. Simulate a short, intense debate between A and B.
                2. Each must stay strictly in character.
                3. Provide a Final Verdict/Synthesis.
                """
                debate = llm_engine(prompt, api_key, model="llama-3.3-70b-versatile")
                st.markdown(debate)

    # === TAB 5: AGENT SQUAD ===
    with tab_squad:
        st.markdown("### 🤖 Specialized Financial Agents")
        st.caption("Deploy expert agents for specific missions.")
        
        agent_choice = st.radio("Select Agent", ["✂️ Budget Agent", "💰 Savings Agent", "📉 Debt Manager", "🔭 Investment Scout"], horizontal=True)
        
        st.divider()
        
        if agent_choice == "✂️ Budget Agent":
            st.markdown("#### Mission: Slash Expenses (AI Auditor)")
            st.info("I will ruthlessly analyze your spending and find the 'impossible' cuts.")
            
            b_income = st.number_input("Monthly Income", 0, 1000000, 50000)
            b_exp = st.number_input("Monthly Expenses", 0, 1000000, 45000)
            categories = st.multiselect("Major Expense Categories", ["Rent", "Food/Dining", "Travel", "Shopping", "Subscriptions", "Entertainment"], default=["Food/Dining", "Shopping"])
            
            if st.button("Analyze Spending"):
                with st.spinner("Crunching numbers..."):
                    prompt = f"""
                    ROLE: You are a Ruthless Financial Auditor.
                    TASK: Analyze this spending profile and find drastic cuts.
                    DATA: Income: ₹{b_income}, Expense: ₹{b_exp}, Problem Areas: {categories}.
                    
                    OUTPUT:
                    1. Calculated Savings Potential (be aggressive).
                    2. 3 Specific, unorthodox 'Hacks' to cut costs in the selected categories.
                    3. A 'Roast' of their current burning rate (Expense/Income ratio).
                    """
                    response = llm_engine(prompt, api_key, model="llama-3.3-70b-versatile")
                    st.markdown(response)
                
        elif agent_choice == "💰 Savings Agent":
            st.markdown("#### Mission: Dream Architect")
            goal_name = st.text_input("Goal Name", "Europe Trip")
            target = st.number_input("Target Amount (₹)", 0, 10000000, 200000)
            months = st.slider("Timeframe (Months)", 1, 60, 12)
            
            if st.button("Build Plan"):
                with st.spinner("Designing blueprint..."):
                    prompt = f"""
                    ROLE: You are a Lifestyle Architect.
                    TASK: Create a gamified savings plan.
                    GOAL: Save ₹{target} for '{goal_name}' in {months} months.
                    
                    OUTPUT:
                    1. The 'DailyGrind' number (how much to save per day).
                    2. A 'Strategy': Where to park this money (Liquid Fund/RD) and why.
                    3. 3 'Level Up' Challenges: Fun ways to save extra money for this specific goal (e.g. 'No Coffee Week').
                    """
                    response = llm_engine(prompt, api_key, model="llama-3.3-70b-versatile")
                    st.markdown(response)
                
        elif agent_choice == "📉 Debt Manager":
            st.markdown("#### Mission: Debt Destroyer")
            d_type = st.selectbox("Loan Type", ["Credit Card", "Personal Loan", "Car Loan", "Home Loan"])
            u_amt = st.number_input("Outstanding Amount (₹)", 0, 10000000, 50000, key="debt_amt")
            u_rate = st.number_input("Interest Rate (%)", 0.0, 50.0, 18.0)
            strategy = st.radio("Preferred Style", ["Avalanche (Math optimal)", "Snowball (Psychology optimal)"])
            
            if st.button("Generate Payoff Strategy"):
                with st.spinner("Strategizing battle plan..."):
                    prompt = f"""
                    ROLE: You are a War General for Debt.
                    TASK: Create a battle plan to destroy this debt.
                    ENEMY: {d_type}, Amount: ₹{u_amt}, Rate: {u_rate}%.
                    STRATEGY: {strategy}.
                    
                    OUTPUT:
                    1. The 'Attack Plan': Step-by-step instructions.
                    2. The 'Mathematics': Show how much interest is bleaching them at {u_rate}%.
                    3. A 'Wartime Speech': Motivate them to kill this debt immediately.
                    """
                    response = llm_engine(prompt, api_key, model="llama-3.3-70b-versatile")
                    st.markdown(response)
                    
        elif agent_choice == "🔭 Investment Scout":
            st.markdown("#### Mission: Market Oracle")
            scout_risk = st.select_slider("My Risk Appetite", ["Scared (Safe)", "Balanced", "Adventurous"])
            capital = st.number_input("Initial Capital (₹)", 1000, 10000000, 10000)
            
            if st.button("Scout Opportunities"):
                 with st.spinner("Scanning market frequencies..."):
                    prompt = f"""
                    ROLE: You are a Sage Investment Scout (Indian Market Context).
                    USER PROFILE: Risk: {scout_risk}, Capital: ₹{capital}.
                    
                    OUTPUT:
                    1. The 'Golden Allocation': Exact % split (e.g. 40% Nifty, 20% Gold).
                    2. The 'Why': deeply analytical but simple explanation of why this mix works for {scout_risk} profile.
                    3. 2 Specific Instrument Recommendations (e.g. specific types of Index Funds or SGBs).
                    4. A 'Warning': What could go wrong.
                    """
                    response = llm_engine(prompt, api_key, model="llama-3.3-70b-versatile")
                    st.markdown(response)

if __name__ == "__main__":
    main()
