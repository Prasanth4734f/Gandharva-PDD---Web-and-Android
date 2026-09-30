import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def upload_music_engine(hf_token: str, username: str):
    try:
        from huggingface_hub import HfApi, create_repo
    except ImportError:
        print("❌ 'huggingface_hub' not installed. Installing...")
        os.system(f"{sys.executable} -m pip install -q huggingface_hub")
        from huggingface_hub import HfApi, create_repo

    api = HfApi(token=hf_token)
    space_repo = f"{username}/gandharva-music-engine"

    print("==========================================================")
    print("  GANDHARVA MUSICGEN AI — HUGGING FACE ZERO-GPU DEPLOYER  ")
    print("==========================================================")
    
    print(f"\n📦 Step 1: Creating Hugging Face Space: {space_repo}")
    try:
        create_repo(space_repo, repo_type="space", space_sdk="gradio", token=hf_token, exist_ok=True)
    except Exception as e:
        print(f"Note: {e}")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    files_to_upload = {
        "app.py": os.path.join(script_dir, "app.py"),
        "README.md": os.path.join(script_dir, "README.md"),
        "requirements.txt": os.path.join(script_dir, "requirements.txt"),
        "packages.txt": os.path.join(script_dir, "packages.txt"),
    }

    print(f"\n🚀 Step 2: Uploading MusicGen files to {space_repo}...")
    for target_name, src_path in files_to_upload.items():
        if os.path.exists(src_path):
            print(f"  -> Uploading {target_name}...")
            api.upload_file(
                path_or_fileobj=src_path,
                path_in_repo=target_name,
                repo_id=space_repo,
                repo_type="space"
            )

    print("\n==========================================================")
    print("✨ SUCCESS! Gandharva Music Engine deployed to 24/7 Space!")
    print(f"🔗 Live Space URL: https://huggingface.co/spaces/{space_repo}")
    print(f"🌐 Permanent API:  https://{username.lower()}-gandharva-music-engine.hf.space")
    print("==========================================================")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python upload_music_to_hf.py <HF_TOKEN> <HF_USERNAME>")
        sys.exit(1)
    upload_music_engine(sys.argv[1], sys.argv[2])
