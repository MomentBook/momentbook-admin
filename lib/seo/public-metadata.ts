import type { Metadata } from "next";

export function buildNoIndexRobots(): Metadata["robots"] {
  return {
    index: false,
    follow: false,
  };
}
