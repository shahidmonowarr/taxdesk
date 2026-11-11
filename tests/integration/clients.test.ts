import { describe, expect, it } from "vitest";
import {
  createClient,
  deleteClient,
  getClient,
  getDashboardStats,
  listClients,
  updateClient,
} from "@/server/clients.service";
import { clientInput, makeUser } from "./factories";

describe("clients service", () => {
  it("creates, reads, updates and deletes a client", async () => {
    const owner = await makeUser();
    const created = await createClient(owner.id, clientInput({ firstName: "Maria", phone: "+1 555 0100" }));

    expect(await getClient(owner.id, created.id)).toMatchObject({ firstName: "Maria", ownerId: owner.id });

    await updateClient(owner.id, created.id, clientInput({ firstName: "Mariana" }));
    const updated = await getClient(owner.id, created.id);
    expect(updated.firstName).toBe("Mariana");
    expect(updated.phone).toBeNull(); // cleared optional field is stored as null

    await deleteClient(owner.id, created.id);
    await expect(getClient(owner.id, created.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("refuses a second record for the same email and tax year", async () => {
    const owner = await makeUser();
    await createClient(owner.id, clientInput({ email: "dup@example.com", taxYear: 2024 }));
    await expect(
      createClient(owner.id, clientInput({ email: "dup@example.com", taxYear: 2024 })),
    ).rejects.toMatchObject({ code: "CONFLICT", field: "email" });
    // Same person, another year, is a separate engagement.
    await expect(createClient(owner.id, clientInput({ email: "dup@example.com", taxYear: 2023 }))).resolves.toBeTruthy();
  });

  it("searches by name and email, case-insensitively", async () => {
    const owner = await makeUser();
    await createClient(owner.id, clientInput({ firstName: "Aisha", lastName: "Rahman", email: "aisha@example.com" }));
    await createClient(owner.id, clientInput({ firstName: "James", lastName: "Chen", email: "jc@example.com" }));

    expect((await listClients(owner.id, { q: "rahm" })).map((c) => c.firstName)).toEqual(["Aisha"]);
    expect((await listClients(owner.id, { q: "JC@" })).map((c) => c.firstName)).toEqual(["James"]);
    expect(await listClients(owner.id)).toHaveLength(2);
  });

  it("summarises the dashboard for the owner only", async () => {
    const owner = await makeUser();
    const other = await makeUser();
    await createClient(owner.id, clientInput({ filingStatus: "SINGLE" }));
    await createClient(owner.id, clientInput({ filingStatus: "SINGLE" }));
    await createClient(owner.id, clientInput({ filingStatus: "HEAD_OF_HOUSEHOLD" }));
    await createClient(other.id, clientInput());

    const stats = await getDashboardStats(owner.id);
    expect(stats.total).toBe(3);
    expect(stats.byStatus).toEqual([
      { status: "SINGLE", count: 2 },
      { status: "HEAD_OF_HOUSEHOLD", count: 1 },
    ]);
  });
});

describe("tenant isolation: one user can never touch another user's clients", () => {
  async function setup() {
    const alice = await makeUser();
    const mallory = await makeUser();
    const record = await createClient(alice.id, clientInput({ firstName: "AlicesClient" }));
    return { alice, mallory, record };
  }

  it("cannot list them", async () => {
    const { mallory } = await setup();
    expect(await listClients(mallory.id)).toEqual([]);
    expect(await listClients(mallory.id, { q: "AlicesClient" })).toEqual([]);
  });

  it("cannot read one by id — it looks exactly like a missing record", async () => {
    const { mallory, record } = await setup();
    await expect(getClient(mallory.id, record.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("cannot update one by id", async () => {
    const { alice, mallory, record } = await setup();
    await expect(updateClient(mallory.id, record.id, clientInput({ firstName: "Hacked" }))).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await getClient(alice.id, record.id)).firstName).toBe("AlicesClient");
  });

  it("cannot delete one by id", async () => {
    const { alice, mallory, record } = await setup();
    await expect(deleteClient(mallory.id, record.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(getClient(alice.id, record.id)).resolves.toBeTruthy();
  });
});
