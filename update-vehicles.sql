-- Obriši stara demo vozila i dodaj Suzuki Vitara flotu
DELETE FROM vehicles;

-- Dodaj 6 Suzuki Vitara 2026
INSERT INTO vehicles (name, category, image_url, price_per_day, seats, transmission, fuel_type, features, rating, available) VALUES
  ('Suzuki Vitara 2026 #1', 'SUV', '🚙', 65.00, 5, 'Automatik', 'Benzin', ARRAY['GPS', 'Klima', 'Bluetooth', 'Kamera za vožnju unatrag', 'Tempomat'], 5.0, true),
  ('Suzuki Vitara 2026 #2', 'SUV', '🚙', 65.00, 5, 'Automatik', 'Benzin', ARRAY['GPS', 'Klima', 'Bluetooth', 'Kamera za vožnju unatrag', 'Tempomat'], 5.0, true),
  ('Suzuki Vitara 2026 #3', 'SUV', '🚙', 65.00, 5, 'Automatik', 'Benzin', ARRAY['GPS', 'Klima', 'Bluetooth', 'Kamera za vožnju unatrag', 'Tempomat'], 5.0, true),
  ('Suzuki Vitara 2026 #4', 'SUV', '🚙', 65.00, 5, 'Automatik', 'Benzin', ARRAY['GPS', 'Klima', 'Bluetooth', 'Kamera za vožnju unatrag', 'Tempomat'], 5.0, true),
  ('Suzuki Vitara 2026 #5', 'SUV', '🚙', 65.00, 5, 'Automatik', 'Benzin', ARRAY['GPS', 'Klima', 'Bluetooth', 'Kamera za vožnju unatrag', 'Tempomat'], 5.0, true),
  ('Suzuki Vitara 2026 #6', 'SUV', '🚙', 65.00, 5, 'Automatik', 'Benzin', ARRAY['GPS', 'Klima', 'Bluetooth', 'Kamera za vožnju unatrag', 'Tempomat'], 5.0, true);
