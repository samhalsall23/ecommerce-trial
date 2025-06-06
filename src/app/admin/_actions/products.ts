"use server";

import { z } from "zod";
import { notFound, redirect } from "next/navigation";

import fs from "fs/promises";

import { prisma } from "@/lib/prisma";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageScheme = fileSchema.refine(
    (file) => file.size === 0 || file.type.startsWith("image/"),
    {
        message: "Invalid file type",
    },
);

const addSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    priceInCents: z.coerce.number().int().min(1),
    file: fileSchema.refine((file) => file.size > 0, "Required"),
    image: imageScheme.refine((file) => file.size > 0, "Required"),
});

export async function addProduct(prevState: unknown, formData: FormData) {
    const result = addSchema.safeParse(Object.fromEntries(formData.entries()));

    if (result.success === false) {
        return result.error.formErrors.fieldErrors;
    }
    const data = result.data;

    await fs.mkdir("products", { recursive: true });
    const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

    await fs.mkdir("public/products", { recursive: true });
    const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
        `public${imagePath}`,
        Buffer.from(await data.image.arrayBuffer()),
    );

    await prisma.product.create({
        data: {
            isAvailableForPurchase: false,
            name: data.name,
            description: data.description,
            priceInCents: data.priceInCents,
            filePath,
            imagePath,
        },
    });

    redirect("/admin/products");
}

const editSchema = addSchema.extend({
    file: fileSchema.optional(),
    image: imageScheme.optional(),
});

export async function updateProduct(
    id: string,
    prevState: unknown,
    formData: FormData,
) {
    const result = editSchema.safeParse(Object.fromEntries(formData.entries()));

    if (result.success === false) {
        return result.error.formErrors.fieldErrors;
    }

    const data = result.data;
    const product = await prisma.product.findUnique({ where: { id } });

    if (product === null) {
        return notFound();
    }

    let filePath = product.filePath;

    if (data.file && data.file.size > 0) {
        await fs.unlink(product.filePath);

        filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
        await fs.writeFile(
            filePath,
            Buffer.from(await data.file.arrayBuffer()),
        );
    }

    let imagePath = product.imagePath;

    if (data.image && data.image.size > 0) {
        await fs.unlink(`public${product.imagePath}`);

        imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
        await fs.writeFile(
            `public${imagePath}`,
            Buffer.from(await data.image.arrayBuffer()),
        );
    }

    await prisma.product.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            priceInCents: data.priceInCents,
            filePath,
            imagePath,
        },
    });

    redirect("/admin/products");
}

export async function toggleProductAvailability(
    id: string,
    isAvailableForPurchase: boolean,
) {
    await prisma.product.update({
        where: { id },
        data: { isAvailableForPurchase },
    });
}

export async function deleteProduct(id: string) {
    const product = await prisma.product.delete({
        where: { id },
    });

    if (product === null) {
        return notFound();
    }

    fs.unlink(product.filePath);
    fs.unlink(`public${product.imagePath}`);
}
