"use client";
import { useState, useEffect } from "react";
import Navbar from "./Navbar/page";

export default function Home() {
  return (
    <div>
      <Navbar />
      <h1 className="text-red-700">Common Home page for all users</h1>
      <h1 className="text-center">NestJS Application</h1>
      <p className="text-center">
        I am a web developer and learning web development on base of awesome
        framework NextJS. This framework is of JavaScript.{" "}
      </p>
    </div>
  );
}
