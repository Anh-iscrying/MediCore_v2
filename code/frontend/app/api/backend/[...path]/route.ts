import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api/v1"

type RouteContext = {
  params: Promise<{ path: string[] }>
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const targetUrl = new URL(`${BACKEND_API_BASE_URL}/${path.join("/")}`)
  targetUrl.search = request.nextUrl.search

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  const authorization = request.headers.get("authorization")
  const accessToken = request.cookies.get("accessToken")?.value

  headers.set("Accept", request.headers.get("accept") || "application/json")
  if (contentType) {
    headers.set("Content-Type", contentType)
  }
  if (authorization) {
    headers.set("Authorization", authorization)
  }
  if (accessToken) {
    headers.set("Cookie", `accessToken=${accessToken}`)
  }

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    redirect: "manual",
  })

  const responseHeaders = new Headers()
  const responseContentType = backendResponse.headers.get("content-type")
  const setCookie = backendResponse.headers.get("set-cookie")

  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType)
  }
  if (setCookie) {
    responseHeaders.set("set-cookie", setCookie)
  }

  if (responseContentType?.includes("text/event-stream")) {
    responseHeaders.set("cache-control", "no-cache")
    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    })
  }

  return new NextResponse(await backendResponse.text(), {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}
