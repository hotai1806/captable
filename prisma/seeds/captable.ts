import { db } from "@/server/db";
import { faker } from "@faker-js/faker";
import colors from "colors";
colors.enable();

/**
 * Seeds a minimal, realistic cap table (share classes, stakeholders, an
 * equity plan with a grant, founder shares, a SAFE, and a bank account) for
 * every company created by `seedCompanies`, so the Launch Dashboard has real
 * data to render instead of showing the empty state.
 */
const seedCaptable = async () => {
  const companies = await db.company.findMany();

  console.log(`Seeding cap tables for ${companies.length} companies`.blue);

  for (const company of companies) {
    const founder = await db.stakeholder.create({
      data: {
        name: faker.person.fullName(),
        email: `founder+${company.publicId}@example.com`,
        stakeholderType: "INDIVIDUAL",
        currentRelationship: "FOUNDER",
        companyId: company.id,
      },
    });

    const employee = await db.stakeholder.create({
      data: {
        name: faker.person.fullName(),
        email: `employee+${company.publicId}@example.com`,
        stakeholderType: "INDIVIDUAL",
        currentRelationship: "EMPLOYEE",
        companyId: company.id,
      },
    });

    const investor = await db.stakeholder.create({
      data: {
        name: `${faker.company.name()} Ventures`,
        email: `investor+${company.publicId}@example.com`,
        stakeholderType: "INSTITUTION",
        currentRelationship: "INVESTOR",
        companyId: company.id,
      },
    });

    const commonStock = await db.shareClass.create({
      data: {
        idx: 1,
        name: "Common Stock",
        classType: "COMMON",
        prefix: "CS",
        initialSharesAuthorized: 10_000_000n,
        boardApprovalDate: faker.date.past(),
        stockholderApprovalDate: faker.date.past(),
        votesPerShare: 1,
        parValue: 0.0001,
        pricePerShare: 0.0001,
        seniority: 0,
        conversionRights: "CONVERTS_TO_FUTURE_ROUND",
        liquidationPreferenceMultiple: 1,
        participationCapMultiple: 1,
        companyId: company.id,
      },
    });

    const preferredStock = await db.shareClass.create({
      data: {
        idx: 2,
        name: "Series Seed Preferred",
        classType: "PREFERRED",
        prefix: "PS",
        initialSharesAuthorized: 2_000_000n,
        boardApprovalDate: faker.date.past(),
        stockholderApprovalDate: faker.date.past(),
        votesPerShare: 1,
        parValue: 0.0001,
        pricePerShare: 0.5,
        seniority: 1,
        conversionRights: "CONVERTS_TO_FUTURE_ROUND",
        liquidationPreferenceMultiple: 1,
        participationCapMultiple: 1,
        companyId: company.id,
      },
    });

    const equityPlan = await db.equityPlan.create({
      data: {
        name: "2024 Equity Incentive Plan",
        boardApprovalDate: faker.date.past(),
        initialSharesReserved: 1_000_000n,
        defaultCancellatonBehavior: "RETURN_TO_POOL",
        shareClassId: commonStock.id,
        companyId: company.id,
      },
    });

    await db.share.create({
      data: {
        status: "ACTIVE",
        certificateId: "CS-1",
        quantity: 4_000_000,
        pricePerShare: 0.0001,
        capitalContribution: 400,
        issueDate: faker.date.past(),
        boardApprovalDate: faker.date.past(),
        stakeholderId: founder.id,
        companyId: company.id,
        shareClassId: commonStock.id,
      },
    });

    await db.option.create({
      data: {
        grantId: "OG-1",
        quantity: 50_000,
        exercisePrice: 0.1,
        type: "ISO",
        status: "ACTIVE",
        cliffYears: 1,
        vestingYears: 4,
        issueDate: faker.date.past(),
        expirationDate: faker.date.future({ years: 10 }),
        vestingStartDate: faker.date.past(),
        boardApprovalDate: faker.date.past(),
        rule144Date: faker.date.future(),
        stakeholderId: employee.id,
        companyId: company.id,
        equityPlanId: equityPlan.id,
      },
    });

    await db.safe.create({
      data: {
        publicId: "SAFE-1",
        type: "POST_MONEY",
        status: "ACTIVE",
        capital: 250_000,
        safeTemplate: "POST_MONEY_CAP",
        valuationCap: 5_000_000,
        issueDate: faker.date.past(),
        boardApprovalDate: faker.date.past(),
        stakeholderId: investor.id,
        companyId: company.id,
      },
    });

    await db.investment.create({
      data: {
        amount: 150_000,
        shares: 300_000n,
        date: faker.date.past(),
        shareClassId: preferredStock.id,
        stakeholderId: investor.id,
        companyId: company.id,
      },
    });

    await db.bankAccount.create({
      data: {
        beneficiaryName: company.name,
        beneficiaryAddress: company.streetAddress,
        bankName: "Mercury",
        bankAddress: "123 Market St, San Francisco, CA",
        accountNumber: faker.finance.accountNumber(10),
        routingNumber: faker.finance.routingNumber(),
        accountType: "CHECKING",
        primary: true,
        companyId: company.id,
      },
    });
  }

  console.log(`🎉 Seeded cap tables for ${companies.length} companies`.green);
};

export default seedCaptable;
