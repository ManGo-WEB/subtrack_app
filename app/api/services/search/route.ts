import { NextRequest, NextResponse } from "next/server";
import { searchServices } from "@/app/actions/services";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const services = await searchServices(query);
    return NextResponse.json(services);
  } catch (error) {
    console.error("Ошибка поиска сервисов:", error);
    return NextResponse.json(
      { error: "Не удалось выполнить поиск" },
      { status: 500 }
    );
  }
}
