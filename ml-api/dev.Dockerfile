FROM python:3.7

ENV ENV=development

WORKDIR /api

COPY . /api

# Using "--default-timeout=1000" to prevent fetch timeout
    # apt-get install ffmpeg libsm6 libxext6 libgl1-mesa-glx -y && \
RUN apt-get update && \
    apt-get install libgl1-mesa-glx poppler-utils -y && \
    pip --default-timeout=1000 install --no-cache-dir -r requirements.txt
    #pip install -r requirements.txt

EXPOSE 5000

ENTRYPOINT ["python3"]
CMD ["app.py"]