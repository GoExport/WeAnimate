import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

FFDEC = ROOT / "tools" / "ffdec" / "ffdec-cli.jar"

PLAYER_SWF = ROOT / "resources" / "static" / "animation" / "414827163ad4eb60" / "player.swf"

BINARYDATA_TARGETS = [
    {
        "char_id": 275,
        "shapes_folder": ROOT / "tools" / "brand" / "player.swfDefineBinaryData (275)" / "shapes",
    },
]


def run_command(cmd):
    print("Running:", " ".join(str(x) for x in cmd))
    result = subprocess.run(cmd)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed with exit code {result.returncode}")


def patch_binarydata(ffdec_path: Path, swf_path: Path, char_id: int, shapes_folder: Path):
    if not ffdec_path.exists():
        raise FileNotFoundError(f"FFDec not found: {ffdec_path}")
    if not swf_path.exists():
        raise FileNotFoundError(f"SWF not found: {swf_path}")
    if not shapes_folder.exists():
        raise FileNotFoundError(f"Shapes folder not found: {shapes_folder}")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        export_dir = tmpdir / "binarydata_export"

        # Step 1: Export binary data (tag char_id) from the SWF
        print(f"\n[1/3] Exporting DefineBinaryData ({char_id}) from {swf_path.name}...")
        run_command([
            "java", "-jar", str(ffdec_path),
            "-selectid", str(char_id),
            "-export", "binaryData", str(export_dir), str(swf_path),
        ])

        # Find the exported binary data file
        exported_files = list(export_dir.rglob("*"))
        exported_files = [f for f in exported_files if f.is_file()]
        if not exported_files:
            raise RuntimeError(f"No binary data exported for character {char_id}")

        # There should be exactly one file for the selected character ID
        embedded_swf = exported_files[0]
        print(f"   Exported: {embedded_swf.name} ({embedded_swf.stat().st_size} bytes)")

        # Step 2: Import shapes into the extracted embedded SWF
        patched_embedded = tmpdir / "patched_embedded.swf"
        print(f"\n[2/3] Importing shapes into embedded SWF...")
        run_command([
            "java", "-jar", str(ffdec_path),
            "-importShapes",
            str(embedded_swf), str(patched_embedded), str(shapes_folder),
        ])

        if not patched_embedded.exists():
            raise RuntimeError("Failed to create patched embedded SWF")
        print(f"   Patched embedded SWF: {patched_embedded.stat().st_size} bytes")

        # Step 3: Replace binary data tag in the original SWF
        temp_output = swf_path.with_name(swf_path.stem + ".bd_patched.tmp.swf")
        backup = swf_path.with_name(swf_path.stem + ".pre_bd.bak")
        print(f"\n[3/3] Replacing DefineBinaryData ({char_id}) in {swf_path.name}...")
        run_command([
            "java", "-jar", str(ffdec_path),
            "-replace",
            str(swf_path), str(temp_output),
            str(char_id), str(patched_embedded),
        ])

        if not temp_output.exists():
            raise RuntimeError(f"No patched output was created for {swf_path}")

        print(f"Creating backup: {backup}")
        shutil.copy2(swf_path, backup)

        print(f"Replacing original: {swf_path}")
        shutil.move(str(temp_output), str(swf_path))

    print(f"Done: {swf_path}")


def main():
    failed = []

    for target in BINARYDATA_TARGETS:
        char_id = target["char_id"]
        shapes_folder = target["shapes_folder"]

        print("\n" + "=" * 60)
        print(f"Patching DefineBinaryData ({char_id}) in {PLAYER_SWF.name}")
        print(f"Using shapes from: {shapes_folder}")
        print("=" * 60)

        try:
            patch_binarydata(FFDEC, PLAYER_SWF, char_id, shapes_folder)
        except Exception as e:
            print(f"FAILED: DefineBinaryData ({char_id}) -> {e}", file=sys.stderr)
            failed.append(f"DefineBinaryData ({char_id})")

    print("\n" + "=" * 60)
    if failed:
        print("Finished with failures:")
        for name in failed:
            print(f" - {name}")
        sys.exit(1)
    else:
        print("All binary data patches applied successfully.")
        sys.exit(0)


if __name__ == "__main__":
    main()
