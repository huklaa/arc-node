#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_TMP="$(mktemp -d)"
trap 'rm -rf "$TEST_TMP"' EXIT

fakebin="$TEST_TMP/fakebin"
arc_home="$TEST_TMP/arc-home"
mkdir -p "$fakebin" "$arc_home"

cat > "$fakebin/curl" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

out=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        -o)
            out="$2"
            shift 2
            ;;
        --retry | --retry-delay | --connect-timeout | --max-time)
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Reproduce curl 8.14.0/8.14.1 with --retry + --fail on a non-retryable
# HTTP error: curl reports success but leaves the destination empty.
: > "$out"
exit 0
EOF
chmod 755 "$fakebin/curl"

out="$TEST_TMP/install.out"
if PATH="$fakebin:$PATH" ARC_HOME="$arc_home" bash "$ROOT_DIR/arcup/install" >"$out" 2>&1; then
    cat "$out" >&2
    echo "not ok - bootstrap rejects empty successful curl download" >&2
    exit 1
fi

if ! grep -q "failed to download arcup" "$out"; then
    cat "$out" >&2
    echo "not ok - bootstrap reports download failure" >&2
    exit 1
fi

if [[ -e "$arc_home/bin/arcup" ]]; then
    ls -l "$arc_home/bin/arcup" >&2
    echo "not ok - bootstrap must not install an empty arcup" >&2
    exit 1
fi

echo "ok - bootstrap rejects empty successful curl download"
