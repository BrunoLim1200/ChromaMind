from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_palette_endpoint():
    response = client.post(
        "/api/v1/palette/generate",
        json={"base_color": "#FF0000", "harmony_type": "complementary"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["base_color"] == "#FF0000"
    assert data["harmony_type"] == "complementary"
    assert len(data["palette"]) == 2
    assert data["palette"][1] == "#00ffff"

def test_generate_palette_invalid_hex():
    response = client.post(
        "/api/v1/palette/generate",
        json={"base_color": "invalid", "harmony_type": "complementary"}
    )
    assert response.status_code == 422
