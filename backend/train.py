import os

from backend.models.frame_model import train_model

if __name__ == "__main__":
    clean_dir = os.path.join("dataset", "clean")
    noisy_dir = os.path.join("dataset", "noisy")
    print(f"Training model on:\n  clean → {clean_dir}\n  noisy → {noisy_dir}")
    model, mean, std = train_model(clean_dir, noisy_dir)
    print("Training complete. Model and stats saved to disk.")