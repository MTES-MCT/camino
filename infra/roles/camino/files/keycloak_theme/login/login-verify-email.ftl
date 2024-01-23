<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true; section>
    <#if section = "form">
            <div class="fr-alert fr-alert--info fr-mt-3w">
                <h3 class="fr-alert__title">${msg("emailVerifyInstruction1",user.email)}</h3>
            </div>
    </#if>
</@layout.registrationLayout>