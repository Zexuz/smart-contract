import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Inheritance", function () {
  async function fixture() {
    const WITHDRAWAL_INTERVAL = 30 * 24 * 60 * 60;

    const [owner, heir1, heir2] = await ethers.getSigners();

    const Inheritance = await ethers.getContractFactory("Inheritance");
    const inheritance = await Inheritance.deploy([heir1.address]);

    return { inheritance, WITHDRAWAL_INTERVAL, owner, heir1, heir2 };
  }

  describe("claimOwnership", function () {
    it("should allow heir to claim ownership after 1 month", async function () {
      const { inheritance, WITHDRAWAL_INTERVAL, heir1 } = await loadFixture(fixture);

      await time.increase(WITHDRAWAL_INTERVAL);

      await inheritance.connect(heir1).claimOwnership();

      expect(await inheritance.owner()).to.equal(heir1.address);
    });

    it("should reset lastWithdrawalTime after claiming ownership", async function () {
      const { inheritance, WITHDRAWAL_INTERVAL, heir1 } = await loadFixture(fixture);

      await time.increase(WITHDRAWAL_INTERVAL);

      await inheritance.connect(heir1).claimOwnership();

      const lastWithdrawalTime = await inheritance.lastWithdrawalTime();
      const currentTime = await time.latest();

      expect(lastWithdrawalTime).to.be.closeTo(currentTime, 2);
    });

    it("should not allow non-heir to claim ownership", async function () {
      const { inheritance, heir2 } = await loadFixture(fixture);

      await expect(inheritance.connect(heir2).claimOwnership()).to.be.revertedWith("Only an heir can call this function");
    });

    it("should not allow heir to claim ownership before 1 month", async function () {
      const { inheritance, heir1 } = await loadFixture(fixture);

      await expect(inheritance.connect(heir1).claimOwnership()).to.be.revertedWith("1 month has not passed since the last withdrawal");
    });
  });

  describe("withdraw", function () {
    it("should allow owner to withdraw funds", async function () {
      const { inheritance, owner } = await loadFixture(fixture);

      const initialBalance = await ethers.provider.getBalance(owner.address);

      await owner.sendTransaction({
        to: inheritance.target,
        value: ethers.parseEther("1.0")
      });

      await inheritance.connect(owner).withdraw(ethers.parseEther("1.0"));

      const finalBalance = await ethers.provider.getBalance(owner.address);

      const initialBalanceNum = parseFloat(ethers.formatEther(initialBalance));
      const finalBalanceNum = parseFloat(ethers.formatEther(finalBalance));

      expect(finalBalanceNum).to.be.closeTo(initialBalanceNum, 0.01); // Allow for gas costs
    });

    it("should not allow non-owner to withdraw funds", async function () {
      const { inheritance, heir1 } = await loadFixture(fixture);

      await expect(inheritance.connect(heir1).withdraw(ethers.parseEther("1.0"))).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should update lastWithdrawalTime after withdrawal", async function () {
      const { inheritance, owner, WITHDRAWAL_INTERVAL } = await loadFixture(fixture);

      await owner.sendTransaction({
        to: inheritance.target,
        value: ethers.parseEther("1.0")
      });

      await inheritance.connect(owner).withdraw(ethers.parseEther("1.0"));

      const lastWithdrawalTime = await inheritance.lastWithdrawalTime();
      const currentTime = await time.latest();

      expect(lastWithdrawalTime).to.be.closeTo(currentTime, 2);
    });
  });
});
