from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

ENDPOINT = "/api/v1/palette/generate-palette"


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to ChromaMind API!"}


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_generate_palette_endpoint():
    response = client.get(
        ENDPOINT, params={"base_color": "#FF0000", "harmony_type": "monochromatic"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["base_color"] == "#FF0000"
    assert "harmonies" in data
    assert "monochromatic" in data["harmonies"]
    # Ensure other harmonies are NOT present (optimization check)
    assert "complementary" not in data["harmonies"]


def test_generate_palette_is_cacheable():
    response = client.get(
        ENDPOINT, params={"base_color": "#FF0000", "harmony_type": "monochromatic"}
    )
    assert response.status_code == 200
    assert "max-age" in response.headers.get("cache-control", "")


def test_generate_palette_invalid_hex():
    response = client.get(
        ENDPOINT, params={"base_color": "invalid", "harmony_type": "monochromatic"}
    )
    assert response.status_code == 422


def test_generate_palette_missing_hash():
    response = client.get(
        ENDPOINT, params={"base_color": "FF0000", "harmony_type": "monochromatic"}
    )
    assert response.status_code == 422


def test_generate_palette_invalid_harmony():
    response = client.get(
        ENDPOINT, params={"base_color": "#FF0000", "harmony_type": "invalid_harmony"}
    )
    assert response.status_code == 422


def test_all_harmony_types():
    harmony_types = ["monochromatic", "analogous", "complementary", "triadic", "split_complementary"]
    for harmony in harmony_types:
        response = client.get(
            ENDPOINT, params={"base_color": "#FF0000", "harmony_type": harmony}
        )
        assert response.status_code == 200
        data = response.json()
        assert harmony in data["harmonies"]
        assert len(data["harmonies"][harmony]) == 5


def test_complementary_palette_structure():
    response = client.get(
        ENDPOINT, params={"base_color": "#0000FF", "harmony_type": "complementary"}
    )
    assert response.status_code == 200
    data = response.json()
    complementary = data["harmonies"]["complementary"]
    assert len(complementary) == 5
    assert all("hex" in color for color in complementary)
    assert all("rgb" in color for color in complementary)
    assert all("wcag_aa_white" in color for color in complementary)
