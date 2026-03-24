import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

FFDEC = ROOT / "tools" / "ffdec" / "ffdec-cli.jar"

TARGETS = [
    {
        "swf": ROOT / "resources" / "static" / "animation" / "414827163ad4eb60" / "cc.swf",
        "branding": ROOT / "tools" / "brand" / "cc.swf",
    },
    {
        "swf": ROOT / "resources" / "static" / "animation" / "414827163ad4eb60" / "go_full.swf",
        "branding": ROOT / "tools" / "brand" / "go_full.swf",
    },
]


def run_command(cmd):
    print("Running:", " ".join(str(x) for x in cmd))
    result = subprocess.run(cmd)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed with exit code {result.returncode}")


def patch_one(ffdec_path: Path, swf_path: Path, branding_path: Path):
    if not ffdec_path.exists():
        raise FileNotFoundError(f"FFDec not found: {ffdec_path}")

    if not swf_path.exists():
        raise FileNotFoundError(f"SWF not found: {swf_path}")

    if not branding_path.exists():
        raise FileNotFoundError(f"Branding folder not found: {branding_path}")

    temp_output = swf_path.with_name(swf_path.stem + ".patched.tmp.swf")
    backup = swf_path.with_suffix(swf_path.suffix + ".bak")

    cmd = [
        "java",
        "-jar",
        str(ffdec_path),
        "-importImages",
        str(swf_path),
        str(temp_output),
        str(branding_path),
    ]

    run_command(cmd)

    if not temp_output.exists():
        raise RuntimeError(f"No patched output was created for {swf_path}")

    print(f"Creating backup: {backup}")
    shutil.copy2(swf_path, backup)

    print(f"Replacing original: {swf_path}")
    shutil.move(str(temp_output), str(swf_path))

    print(f"Done: {swf_path}")


def main():
    failed = []

    for target in TARGETS:
        swf = target["swf"]
        branding = target["branding"]

        print("\n" + "=" * 60)
        print(f"Patching: {swf.name}")
        print(f"Using branding from: {branding}")
        print("=" * 60)

        try:
            patch_one(FFDEC, swf, branding)
        except Exception as e:
            print(f"FAILED: {swf.name} -> {e}", file=sys.stderr)
            failed.append(swf.name)

    print("\n" + "=" * 60)
    if failed:
        print("Finished with failures:")
        for name in failed:
            print(f" - {name}")
        sys.exit(1)
    else:
        print("All SWFs patched successfully.")
        sys.exit(0)


if __name__ == "__main__":
    main()