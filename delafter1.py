import face_recognition
import os
import glob
import mysql.connector

# Connect to MySQL database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='missing'
)

# Create cursor
cursor = conn.cursor()

# Load an image from the 'unknown' folder in the same directory
dirname = os.path.dirname(__file__)
unknown_image_path = os.path.join(dirname, 'post/public/uploads/*.jpg')

# Get a list of all image files in the 'unknown' folder
unknown_image_files = glob.glob(unknown_image_path)

# Iterate through each unknown image
for unknown_image_file in unknown_image_files:
    # Load the image
    unknown_image = face_recognition.load_image_file(unknown_image_file)

    # Find face locations and encodings in the unknown image
    unknown_face_locations = face_recognition.face_locations(unknown_image)
    unknown_face_encodings = face_recognition.face_encodings(unknown_image, unknown_face_locations)

    # Load known faces and their names
    known_face_encodings = []
    known_face_names = []
    known_people_path = os.path.join(dirname, 'post/public/post_images/')

    # Get a list of all image files in the 'known_people' folder
    known_image_files = glob.glob(known_people_path + '*.jpg')

    # Load each known face and its name
    for known_image_file in known_image_files:
        known_name = os.path.splitext(os.path.basename(known_image_file))[0]
        known_image = face_recognition.load_image_file(known_image_file)
        known_encoding = face_recognition.face_encodings(known_image)[0]
        known_face_encodings.append(known_encoding)
        known_face_names.append(known_name)

    # Compare unknown faces with known faces
    for unknown_face_encoding in unknown_face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, unknown_face_encoding)

        # If a match was found in known_face_encodings, save the result to the database
        found_match = False
        matched_name = None
        for i, match in enumerate(matches):
            if match:
                matched_name = known_face_names[i]
                found_match = True
                break

        # Insert the result into the database
        cursor.execute("INSERT INTO results (unknown_image_file, match_found, matched_name) VALUES (%s, %s, %s)",
                       (unknown_image_file, found_match, matched_name))

        # Print the result to the console
        if found_match:
            print(f"Found match: {matched_name}")
        else:
            print("No match found")

    # Delete the unknown image file after processing
    os.remove(unknown_image_file)

# Commit changes and close connection
conn.commit()
cursor.close()
conn.close()
