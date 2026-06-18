import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { WishlistProvider, useWishlist } from "@/contexts/WishlistContext";

// Simple test helper component
function TestComponent() {
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist } = useWishlist();

  return (
    <div>
      <div data-testid="wishlist-count">{wishlist.length}</div>
      <div data-testid="in-wishlist">{isInWishlist("1") ? "yes" : "no"}</div>
      <button data-testid="add-btn" onClick={() => addToWishlist("1")}>Add 1</button>
      <button data-testid="remove-btn" onClick={() => removeFromWishlist("1")}>Remove 1</button>
      <button data-testid="clear-btn" onClick={clearWishlist}>Clear</button>
    </div>
  );
}

describe("WishlistContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with an empty wishlist", () => {
    render(
      <WishlistProvider>
        <TestComponent />
      </WishlistProvider>
    );

    expect(screen.getByTestId("wishlist-count").textContent).toBe("0");
    expect(screen.getByTestId("in-wishlist").textContent).toBe("no");
  });

  it("should add and remove items in the wishlist", () => {
    render(
      <WishlistProvider>
        <TestComponent />
      </WishlistProvider>
    );

    // Add item
    act(() => {
      screen.getByTestId("add-btn").click();
    });
    expect(screen.getByTestId("wishlist-count").textContent).toBe("1");
    expect(screen.getByTestId("in-wishlist").textContent).toBe("yes");

    // Remove item
    act(() => {
      screen.getByTestId("remove-btn").click();
    });
    expect(screen.getByTestId("wishlist-count").textContent).toBe("0");
    expect(screen.getByTestId("in-wishlist").textContent).toBe("no");
  });

  it("should clear the wishlist", () => {
    render(
      <WishlistProvider>
        <TestComponent />
      </WishlistProvider>
    );

    act(() => {
      screen.getByTestId("add-btn").click();
    });
    expect(screen.getByTestId("wishlist-count").textContent).toBe("1");

    act(() => {
      screen.getByTestId("clear-btn").click();
    });
    expect(screen.getByTestId("wishlist-count").textContent).toBe("0");
  });
});
