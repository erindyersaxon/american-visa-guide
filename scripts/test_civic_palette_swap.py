import importlib.util, json, pathlib, unittest

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("civic_swap", HERE / "civic-palette-swap.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
CMAP = json.loads((HERE / "civic-palette-map.json").read_text())


class SwapTests(unittest.TestCase):
    def test_hex_case_insensitive(self):
        self.assertEqual(mod.swap("#3E7188", CMAP), "#0f172a")

    def test_rgba_keeps_alpha(self):
        self.assertEqual(mod.swap("rgba(90, 143, 166, 0.12)", CMAP), "rgba(71,85,105, 0.12)")

    def test_protected_unchanged(self):
        s = "#bf3b3b #2e4a7d #1A5FB4"
        self.assertEqual(mod.swap(s, CMAP), s)

    def test_short_hex_unchanged(self):
        self.assertEqual(mod.swap("#fff", CMAP), "#fff")


if __name__ == "__main__":
    unittest.main()
