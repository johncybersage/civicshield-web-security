from starlette.datastructures import Headers
h = Headers({"host": "localhost"})
print("Missing default:", h.get("x-forwarded-for", ""))
print("Missing none:", h.get("x-forwarded-for"))
