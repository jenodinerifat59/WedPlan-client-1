
import BookingForm from "./BookingForm";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { serviceId } = await searchParams;

  if (!serviceId) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-2xl font-bold">
          Service ID is missing!
        </h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F0] px-6 py-16">
      <BookingForm serviceId={serviceId} />
    </main>
  );
}
