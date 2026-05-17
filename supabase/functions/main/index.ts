Deno.serve((_request) => {
  return new Response(
    JSON.stringify({
      message: "Hello from Supabase Edge Runtime on Hostess",
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
});
