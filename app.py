from flask import Flask, render_template, request, send_file
import gzip
import os

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
COMPRESSED_FOLDER = "compressed"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(COMPRESSED_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/process", methods=["POST"])
def process_file():
    file = request.files["file"]
    mode = request.form["mode"]        # compress / decompress
    file_type = request.form["type"]   # image / text
    quality = request.form.get("quality", 75)

    filename = file.filename
    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(upload_path)

    # Simple logic for text compression using gzip
    if file_type == "text" and mode == "compress":
        output_path = os.path.join(COMPRESSED_FOLDER, filename + ".gz")
        with open(upload_path, "rb") as f_in, gzip.open(output_path, "wb") as f_out:
            f_out.writelines(f_in)
        return send_file(output_path, as_attachment=True)

    elif file_type == "text" and mode == "decompress":
        output_path = os.path.join(COMPRESSED_FOLDER, filename.replace(".gz", ""))
        with gzip.open(upload_path, "rb") as f_in, open(output_path, "wb") as f_out:
            f_out.writelines(f_in)
        return send_file(output_path, as_attachment=True)

    # For images (basic example)
    elif file_type == "image" and mode == "compress":
        import cv2
        img = cv2.imread(upload_path)
        output_path = os.path.join(COMPRESSED_FOLDER, "compressed_" + filename)
        cv2.imwrite(output_path, img, [cv2.IMWRITE_JPEG_QUALITY, int(quality)])
        return send_file(output_path, as_attachment=True)

    else:
        return "Feature not implemented yet."

if __name__ == "__main__":
    app.run(debug=True)
