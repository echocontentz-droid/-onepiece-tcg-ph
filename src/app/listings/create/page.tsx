import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/marketplace/Navbar";
import { Footer } from "@/components/marketplace/Footer";
import { ListingForm } from "./ListingForm";

export const metadata = {
  title: "List a Card for Sale | OP TCG PH",
};

export default async function CreateListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/listings/create");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.is_banned) redirect("/");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">List a Card for Sale</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details below. Clear photos increase your chances of selling fast.
          </p>
        </div>
        <ListingForm userId={user.id} />
      </main>
      <Footer />
    </div>
  );
}
