import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HomePage } from "./HomePage";

test("renders home", () => {
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>,
  );
  expect(screen.getByText("AnyCompany Store")).toBeInTheDocument();
});
