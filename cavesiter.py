import argparse
import zipfile
import requests
import os
import subprocess

def color(text, color_code):
    return f"\033[{color_code}m{text}\033[0m"

def download_file(url, dest):
    response = requests.get(url, stream=True)
    total_length = response.headers.get('content-length')

    if total_length is None:  # No content length header
        print("No content length header available.")
        with open(dest, 'wb') as f:
            f.write(response.content)
    else:
        total_length = int(total_length)
        downloaded = 0
        with open(dest, 'wb') as f:
            for data in response.iter_content(chunk_size=4096):
                downloaded += len(data)
                f.write(data)
                done = int(50 * downloaded / total_length)
                print(f"\r[{color('=' * done, 32)}{color(' ' * (50-done), 37)}] {color(f'{downloaded / total_length * 100:.2f}%', 32)}", end='')

        print()  # Move to the next line after the download is complete

# Step 2: Create Argument Parser
parser = argparse.ArgumentParser(description="CLI tool for modifying Cavesiter.")
subparsers = parser.add_subparsers(dest='command')
# Step 3: Add Arguments
init_parser = subparsers.add_parser('init', help='Initializes Cavesiter and downloads it.')
init_parser.add_argument('--main', action='store_true', help='To choose the main branch.')
init_parser.add_argument('--dev', action='store_true', help='To choose the development branch.')
# Step 4: Parse Arguments
args = parser.parse_args()
if args.main:
    print(color("Initializing Cavesiter with the main branch.", 37))
    print(color("Fetching from latest build...", 37))
    download_file("https://thebest12dev.github.io/resources/cavesiter/cavesiter.zip", "cavesiter.zip")
    print(color("Unzipping to ./cavesiter-main...", 37))
    with zipfile.ZipFile("cavesiter.zip", 'r') as zip_ref:
        zip_ref.extractall("cavesiter-main")
    print(color("Installing required dependencies...", 37))
    # Run the command without stdout and stderr
    subprocess.run("npm install typescript webpack webpack-cli ts-loader terser-webpack-plugin", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(color("Done! You should be able to use Cavesiter.", 37))
    os.remove('cavesiter.zip')
elif args.dev:
    print(color("Initializing Cavesiter with the dev branch.", 37))
    print(color("Fetching from latest build...", 37))
    download_file("https://thebest12dev.github.io/resources/cavesiter/cavesiter-dev.zip", "cavesiter.zip")
    print(color("Unzipping to ./cavesiter-dev...", 37))
    with zipfile.ZipFile("cavesiter.zip", 'r') as zip_ref:
        zip_ref.extractall("cavesiter-dev")
    print(color("Installing required dependencies...", 37))
    # Run the command without stdout and stderr
    subprocess.run("npm install typescript webpack webpack-cli ts-loader terser-webpack-plugin", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(color("Done! You should be able to use Cavesiter.", 37))
    os.remove('cavesiter.zip')