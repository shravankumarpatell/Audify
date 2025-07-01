"""
Main entrypoint for Audify: train model and enhance a test file.
Run as a module from project root:
    python -m backend.app
"""
from backend.models.frame_model import train_model, enhance_audio
import os


def main():
    clean_dir = os.path.join('dataset', 'clean')
    noisy_dir = os.path.join('dataset', 'noisy')

    # 1. Train
    model, mean, std = train_model(clean_dir, noisy_dir)

    # 2. Enhance example file
    test_file = os.path.join(noisy_dir, 'p232_023.wav')
    enhance_audio(model, test_file, mean, std,
                  output_path=os.path.join('outputs', 'enhanced.wav'))


if __name__ == '__main__':
    main()