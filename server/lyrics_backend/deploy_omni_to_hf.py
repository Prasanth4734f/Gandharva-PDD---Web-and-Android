import os
import sys

# Reconfigure stdout for utf-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def deploy_gandharva_omni(hf_token: str, username: str):
    try:
        from huggingface_hub import HfApi, create_repo
    except ImportError:
        print("📦 Installing 'huggingface_hub'...")
        os.system(f"{sys.executable} -m pip install -q huggingface_hub")
        from huggingface_hub import HfApi, create_repo

    api = HfApi(token=hf_token)
    model_repo = f"{username}/gandharva-omni-weights"
    space_repo = f"{username}/gandharva-omni-ai"
    
    print("==========================================================")
    print("  GANDHARVA-OMNI AI — HUGGING FACE 100% FREE DEPLOYER    ")
    print("==========================================================")
    
    # 1. Locate weights directory
    weights_candidates = [
        "c:/nusic_gen/server/gandharva_omni_weights",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "gandharva_omni_weights")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "gandharva_omni_weights")),
        "gandharva_omni_weights"
    ]
    
    adapter_path = None
    for candidate in weights_candidates:
        if os.path.exists(candidate) and os.path.exists(os.path.join(candidate, "adapter_config.json")):
            adapter_path = candidate
            break

    if not adapter_path:
        raise FileNotFoundError("❌ Could not locate extracted folder 'gandharva_omni_weights'. Please check the path.")

    print(f"\n📦 Step 1: Creating Hugging Face Model Repository: {model_repo}")
    try:
        create_repo(model_repo, repo_type="model", token=hf_token, exist_ok=True)
        print(f"✅ Model repo ready: https://huggingface.co/{model_repo}")
    except Exception as e:
        print(f"ℹ️ Note: {e}")

    print(f"🚀 Uploading LoRA weights and tokenizers from '{adapter_path}'...")
    api.upload_folder(
        folder_path=adapter_path,
        repo_id=model_repo,
        repo_type="model"
    )
    print("✅ Model weights uploaded successfully!")

    # 2. Create and configure Space (ZeroGPU Enabled)
    print(f"\n📦 Step 2: Creating Hugging Face Space: {space_repo}")
    try:
        create_repo(space_repo, repo_type="space", space_sdk="gradio", token=hf_token, exist_ok=True)
        print(f"✅ Space repo ready: https://huggingface.co/spaces/{space_repo}")
    except Exception as e:
        print(f"ℹ️ Note: {e}")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    space_files = {
        "app.py": os.path.join(script_dir, "hf_space_omni_app.py"),
        "README.md": os.path.join(script_dir, "hf_space_omni_readme.md"),
        "requirements.txt": os.path.join(script_dir, "hf_space_omni_requirements.txt"),
    }

    print(f"🚀 Uploading Gradio App files to Space: {space_repo}...")
    for target_name, src_path in space_files.items():
        if os.path.exists(src_path):
            print(f"  -> Uploading {target_name}...")
            api.upload_file(
                path_or_fileobj=src_path,
                path_in_repo=target_name,
                repo_id=space_repo,
                repo_type="space"
            )

    print("\n==========================================================")
    print("✨ SUCCESS! Gandharva-Omni Studio AI is deployed for FREE!")
    print(f"🔗 Model Hub:    https://huggingface.co/{model_repo}")
    print(f"🔗 Live Space:   https://huggingface.co/spaces/{space_repo}")
    print(f"🌐 Public API:   https://{username.lower()}-gandharva-omni-ai.hf.space")
    print("==========================================================")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python deploy_omni_to_hf.py <HF_TOKEN> <HF_USERNAME>")
        sys.exit(1)
    deploy_gandharva_omni(sys.argv[1], sys.argv[2])
