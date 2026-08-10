declare module '#app' {
  interface NuxtApp {
    $apiBase: $Fetch<unknown, NitroFetchRequest>
  }
}

export {}
