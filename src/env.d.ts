/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    serverIslandCache?: {
      ttlSeconds: number;
      isAvailable: boolean;
    };
  }
}
